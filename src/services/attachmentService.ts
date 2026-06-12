import { supabase } from '../lib/supabaseClient';

const bucketName = 'control-attachments';

function safeName(name: string): string {
  return name.split(' ').join('-');
}

export async function uploadControlAttachment(input: {
  organizationId: string;
  controlRunId: string;
  controlRunItemId: string;
  uploadedBy: string;
  file: File;
}): Promise<void> {
  const storagePath = `${input.organizationId}/${input.controlRunId}/${input.controlRunItemId}/${Date.now()}-${safeName(input.file.name)}`;

  const { error: storageError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, input.file, { upsert: false });

  if (storageError) {
    throw storageError;
  }

  const { error: metadataError } = await supabase.from('attachments').insert({
    organization_id: input.organizationId,
    control_run_id: input.controlRunId,
    control_run_item_id: input.controlRunItemId,
    storage_bucket: bucketName,
    storage_path: storagePath,
    file_name: input.file.name,
    content_type: input.file.type,
    size_bytes: input.file.size,
    uploaded_by: input.uploadedBy,
  });

  if (metadataError) {
    throw metadataError;
  }
}
