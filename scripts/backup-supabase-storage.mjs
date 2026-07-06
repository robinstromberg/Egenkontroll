/* global Buffer, console, process */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const BUCKETS = ['control-attachments', 'organization-branding'];
const PAGE_LIMIT = 1000;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} saknas. Ange den som miljovariabel, inte i repo.`);
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
    throw new Error('STORAGE_BACKUP_DIR maste ligga utanfor repot sa att filer inte hamnar i Git.');
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

      objects.push({
        bucket,
        path: objectPath,
        createdAt: entry.created_at ?? null,
        updatedAt: entry.updated_at ?? null,
        lastAccessedAt: entry.last_accessed_at ?? null,
        metadata: entry.metadata ?? null,
      });
    }

    if (entries.length < PAGE_LIMIT) break;
    offset += PAGE_LIMIT;
  }

  return objects;
}

async function downloadObject(supabase, backupRoot, object) {
  const { data, error } = await supabase.storage.from(object.bucket).download(object.path);
  if (error) {
    throw new Error(`Kunde inte ladda ner ${object.bucket}/${object.path}: ${error.message}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const targetPath = resolveObjectPath(backupRoot, object.bucket, object.path);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, buffer);

  return {
    bucket: object.bucket,
    path: object.path,
    sizeBytes: buffer.byteLength,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    contentType: data.type || object.metadata?.mimetype || null,
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
    lastAccessedAt: object.lastAccessedAt,
  };
}

function createManifestPath(backupRoot) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(backupRoot, `storage-backup-manifest-${timestamp}.json`);
}

async function main() {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const backupRoot = readBackupRoot();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  await mkdir(backupRoot, { recursive: true });

  const objects = [];
  for (const bucket of BUCKETS) {
    const bucketObjects = await listObjects(supabase, bucket);
    console.log(`${bucket}: ${bucketObjects.length} objekt hittade.`);
    objects.push(...bucketObjects);
  }

  const manifestObjects = [];
  for (const object of objects) {
    manifestObjects.push(await downloadObject(supabase, backupRoot, object));
  }

  const manifest = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    projectHost: new URL(supabaseUrl).host,
    buckets: BUCKETS,
    objectCount: manifestObjects.length,
    objects: manifestObjects,
  };

  const manifestPath = createManifestPath(backupRoot);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });

  console.log(`Storage-backup klar. Manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
