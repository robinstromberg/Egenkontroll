/* global console, process */
import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const PAGE_LIMIT = 1000;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} saknas.`);
  }

  return value;
}

function isInsidePath(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function readBackupRoot() {
  const backupRoot = path.resolve(requireEnv('STORAGE_BACKUP_DIR'));

  if (isInsidePath(repoRoot, backupRoot)) {
    throw new Error('STORAGE_BACKUP_DIR maste ligga utanfor repot.');
  }

  return backupRoot;
}

function resolveObjectPath(backupRoot, bucket, storagePath) {
  if (!storagePath || storagePath.includes('\\')) {
    throw new Error(`Ogiltig storage path i bucket ${bucket}.`);
  }

  const baseDir = path.resolve(backupRoot, bucket);
  const parts = storagePath.split('/').filter(Boolean);

  if (parts.some((part) => part === '.' || part === '..' || path.isAbsolute(part))) {
    throw new Error(`Osaker storage path nekades i bucket ${bucket}.`);
  }

  const targetPath = path.resolve(baseDir, ...parts);
  if (!isInsidePath(baseDir, targetPath)) {
    throw new Error(`Storage path hamnade utanfor backupmappen i bucket ${bucket}.`);
  }

  return targetPath;
}

async function findManifestPath(backupRoot) {
  if (process.env.STORAGE_BACKUP_MANIFEST?.trim()) {
    return path.resolve(process.env.STORAGE_BACKUP_MANIFEST);
  }

  const entries = await readdir(backupRoot);
  const manifests = entries
    .filter((entry) => /^storage-backup-manifest-.*\.json$/.test(entry))
    .sort()
    .reverse();

  if (manifests.length === 0) {
    throw new Error('Ingen storage-backup-manifest-*.json hittades i STORAGE_BACKUP_DIR.');
  }

  return path.join(backupRoot, manifests[0]);
}

function isFolderEntry(entry) {
  return !entry.id;
}

async function listObjects(supabase, bucket, prefix = '') {
  const bucketClient = supabase.storage.from(bucket);
  const objects = [];
  let offset = 0;

  while (true) {
    const { data, error } = await bucketClient.list(prefix, {
      limit: PAGE_LIMIT,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw new Error(`Kunde inte lista bucket ${bucket}: ${error.message}`);
    }

    const entries = data ?? [];
    for (const entry of entries) {
      const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (isFolderEntry(entry)) {
        objects.push(...await listObjects(supabase, bucket, objectPath));
        continue;
      }

      objects.push({ bucket, path: objectPath });
    }

    if (entries.length < PAGE_LIMIT) break;
    offset += PAGE_LIMIT;
  }

  return objects;
}

async function verifyLocalObject(backupRoot, object) {
  const filePath = resolveObjectPath(backupRoot, object.bucket, object.path);
  const fileStats = await stat(filePath);

  if (!fileStats.isFile()) {
    return [`Inte en fil: ${object.bucket}/${object.path}`];
  }

  const buffer = await readFile(filePath);
  const failures = [];

  if (fileStats.size !== object.sizeBytes) {
    failures.push(`Fel storlek: ${object.bucket}/${object.path}`);
  }

  const sha256 = createHash('sha256').update(buffer).digest('hex');
  if (sha256 !== object.sha256) {
    failures.push(`Fel checksumma: ${object.bucket}/${object.path}`);
  }

  return failures;
}

function hasRemoteVerificationEnv() {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

async function verifyRemoteObjects(manifest) {
  const supabase = createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const remoteObjects = [];
  for (const bucket of manifest.buckets) {
    remoteObjects.push(...await listObjects(supabase, bucket));
  }

  const manifestKeys = new Set(manifest.objects.map((object) => `${object.bucket}/${object.path}`));
  const remoteKeys = new Set(remoteObjects.map((object) => `${object.bucket}/${object.path}`));

  const failures = remoteObjects
    .map((object) => `${object.bucket}/${object.path}`)
    .filter((key) => !manifestKeys.has(key))
    .map((key) => `Remote-objekt saknas i backupmanifestet: ${key}`);

  const warnings = manifest.objects
    .map((object) => `${object.bucket}/${object.path}`)
    .filter((key) => !remoteKeys.has(key))
    .map((key) => `Objekt finns i backup men inte langre remote: ${key}`);

  return { failures, warnings };
}

async function main() {
  const backupRoot = readBackupRoot();
  const manifestPath = await findManifestPath(backupRoot);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.objects) || !Array.isArray(manifest.buckets)) {
    throw new Error('Manifestet har okant format.');
  }

  const failures = [];
  const warnings = [];

  for (const object of manifest.objects) {
    try {
      failures.push(...await verifyLocalObject(backupRoot, object));
    } catch (error) {
      failures.push(`${object.bucket}/${object.path}: ${error instanceof Error ? error.message : error}`);
    }
  }

  if (hasRemoteVerificationEnv()) {
    const remoteResult = await verifyRemoteObjects(manifest);
    failures.push(...remoteResult.failures);
    warnings.push(...remoteResult.warnings);
  } else {
    warnings.push('Remote-jamforelse hoppades over eftersom SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY saknas.');
  }

  if (warnings.length > 0) {
    console.warn('Varningar:');
    for (const warning of warnings) console.warn(`- ${warning}`);
  }

  if (failures.length > 0) {
    console.error('Storage-backup verifiering misslyckades:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Storage-backup verifierad: ${manifest.objects.length} objekt kontrollerade.`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
