import { supabase } from '../lib/supabaseClient';

const bucketName = 'control-attachments';
const signedUrlExpiresInSeconds = 60 * 10;
const maxImageWidth = 1200;
const jpegQuality = 0.82;

export type AttachmentStorageReference = {
  id: string;
  storage_bucket: string | null;
  storage_path: string | null;
};

export type SignedAttachmentUrl = {
  id: string;
  signed_url: string | null;
  signed_url_expires_at: string | null;
};

export type UploadedControlAttachment = {
  controlRunItemId: string;
  storageBucket: string;
  storagePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

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
  file: File;
}): Promise<UploadedControlAttachment> {
  const uploadFile = await compressImage(input.file);
  const storagePath = `${input.organizationId}/${input.controlRunId}/${input.controlRunItemId}/${Date.now()}-${safeName(uploadFile.name)}`;

  const { error: storageError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, uploadFile, { upsert: false, contentType: uploadFile.type });

  if (storageError) {
    throw storageError;
  }

  return {
    controlRunItemId: input.controlRunItemId,
    storageBucket: bucketName,
    storagePath,
    fileName: uploadFile.name,
    contentType: uploadFile.type,
    sizeBytes: uploadFile.size,
  };
}

export function isImageAttachment(attachment: { content_type?: string | null; file_name?: string | null }): boolean {
  if (attachment.content_type?.startsWith('image/')) return true;

  return /\.(avif|gif|jpe?g|png|webp)$/i.test(attachment.file_name ?? '');
}

export async function createSignedAttachmentUrl(
  attachment: AttachmentStorageReference,
  expiresInSeconds = signedUrlExpiresInSeconds,
): Promise<SignedAttachmentUrl> {
  if (!attachment.storage_bucket || !attachment.storage_path) {
    return { id: attachment.id, signed_url: null, signed_url_expires_at: null };
  }

  const { data, error } = await supabase.storage
    .from(attachment.storage_bucket)
    .createSignedUrl(attachment.storage_path, expiresInSeconds);

  if (error) {
    throw error;
  }

  return {
    id: attachment.id,
    signed_url: data.signedUrl,
    signed_url_expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
  };
}

export async function createSignedAttachmentUrls(
  attachments: AttachmentStorageReference[],
  expiresInSeconds = signedUrlExpiresInSeconds,
): Promise<Map<string, SignedAttachmentUrl>> {
  const signedUrls = await Promise.all(
    attachments.map((attachment) => createSignedAttachmentUrl(attachment, expiresInSeconds)),
  );

  return new Map(signedUrls.map((signedUrl) => [signedUrl.id, signedUrl]));
}
