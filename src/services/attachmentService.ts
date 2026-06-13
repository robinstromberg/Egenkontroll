import { supabase } from '../lib/supabaseClient';

const bucketName = 'control-attachments';
const maxImageWidth = 1200;
const jpegQuality = 0.82;

function safeName(name: string): string {
  return name.split(' ').join('-');
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Kunde inte läsa bilden.'));
    };

    image.src = url;
  });
}

async function compressImage(file: File): Promise<File> {
  if (!isImage(file)) return file;

  const image = await loadImage(file);
  const scale = image.width > maxImageWidth ? maxImageWidth / image.width : 1;
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return file;

  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(file);
          return;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '');
        resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      jpegQuality,
    );
  });
}

export async function uploadControlAttachment(input: {
  organizationId: string;
  controlRunId: string;
  controlRunItemId: string;
  uploadedBy: string;
  file: File;
}): Promise<void> {
  const uploadFile = await compressImage(input.file);
  const storagePath = `${input.organizationId}/${input.controlRunId}/${input.controlRunItemId}/${Date.now()}-${safeName(uploadFile.name)}`;

  const { error: storageError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, uploadFile, { upsert: false, contentType: uploadFile.type });

  if (storageError) {
    throw storageError;
  }

  const { error: metadataError } = await supabase.from('attachments').insert({
    organization_id: input.organizationId,
    control_run_id: input.controlRunId,
    control_run_item_id: input.controlRunItemId,
    storage_bucket: bucketName,
    storage_path: storagePath,
    file_name: uploadFile.name,
    content_type: uploadFile.type,
    size_bytes: uploadFile.size,
    uploaded_by: input.uploadedBy,
  });

  if (metadataError) {
    throw metadataError;
  }
}
