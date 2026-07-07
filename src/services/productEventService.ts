import { supabase } from '../lib/supabaseClient';

export type ProductEventName =
  | 'session_loaded'
  | 'organization_setup_viewed'
  | 'organization_created'
  | 'templates_selected'
  | 'invitation_accepted'
  | 'today_viewed'
  | 'control_started'
  | 'control_saved'
  | 'control_save_failed'
  | 'history_viewed'
  | 'share_viewed'
  | 'share_link_created'
  | 'pwa_guide_shown'
  | 'pwa_guide_snoozed'
  | 'pwa_guide_completed';

type SafeMetadataValue = string | number | boolean | null;

export type ProductEventMetadata = Partial<Record<
  | 'available_template_count'
  | 'control_category'
  | 'control_count'
  | 'control_frequency'
  | 'control_type_id'
  | 'daily_control_count'
  | 'error_category'
  | 'field_count'
  | 'first_run_mode'
  | 'has_photo'
  | 'is_online'
  | 'object_count'
  | 'open_deviation_count'
  | 'selected_template_count'
  | 'share_mode'
  | 'source'
  | 'status',
  SafeMetadataValue
>>;

type TrackProductEventInput = {
  eventName: ProductEventName;
  userId: string | null | undefined;
  organizationId?: string | null;
  metadata?: ProductEventMetadata;
};

const PRODUCT_EVENT_SESSION_KEY = 'min-egenkontroll:product-event-session-id';
const MAX_METADATA_STRING_LENGTH = 120;
const MAX_ROUTE_LENGTH = 160;

const allowedMetadataKeys = new Set<keyof ProductEventMetadata>([
  'available_template_count',
  'control_category',
  'control_count',
  'control_frequency',
  'control_type_id',
  'daily_control_count',
  'error_category',
  'field_count',
  'first_run_mode',
  'has_photo',
  'is_online',
  'object_count',
  'open_deviation_count',
  'selected_template_count',
  'share_mode',
  'source',
  'status',
]);

let cachedSessionId: string | null = null;

function createSessionId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  if (cachedSessionId) return cachedSessionId;

  try {
    const stored = window.sessionStorage.getItem(PRODUCT_EVENT_SESSION_KEY);
    if (stored) {
      cachedSessionId = stored;
      return stored;
    }

    const nextSessionId = createSessionId();
    window.sessionStorage.setItem(PRODUCT_EVENT_SESSION_KEY, nextSessionId);
    cachedSessionId = nextSessionId;
    return nextSessionId;
  } catch {
    cachedSessionId = createSessionId();
    return cachedSessionId;
  }
}

function readRoute(): string | null {
  if (typeof window === 'undefined') return null;
  return (window.location.pathname || '/').slice(0, MAX_ROUTE_LENGTH);
}

function sanitizeMetadata(metadata?: ProductEventMetadata): Record<string, SafeMetadataValue> {
  if (!metadata) return {};

  const result: Record<string, SafeMetadataValue> = {};

  for (const key of allowedMetadataKeys) {
    const value = metadata[key];
    if (value === undefined) continue;

    if (typeof value === 'string') {
      result[key] = value.trim().slice(0, MAX_METADATA_STRING_LENGTH);
      continue;
    }

    if (typeof value === 'number') {
      if (Number.isFinite(value)) result[key] = value;
      continue;
    }

    if (typeof value === 'boolean' || value === null) {
      result[key] = value;
    }
  }

  return result;
}

export function getProductEventErrorCategory(error: unknown, isOnline = true): string {
  if (!isOnline) return 'offline';

  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
    return 'network';
  }

  if (
    message.includes('permission') ||
    message.includes('policy') ||
    message.includes('row-level security') ||
    message.includes('42501')
  ) {
    return 'permission';
  }

  if (message.includes('storage') || message.includes('bucket') || message.includes('upload')) {
    return 'storage';
  }

  if (message.includes('invalid') || message.includes('required') || message.includes('constraint')) {
    return 'validation';
  }

  return 'unknown';
}

export function trackProductEvent({
  eventName,
  userId,
  organizationId = null,
  metadata,
}: TrackProductEventInput): void {
  if (!userId) return;

  const payload = {
    event_name: eventName,
    user_id: userId,
    organization_id: organizationId,
    route: readRoute(),
    session_id: readSessionId(),
    metadata: sanitizeMetadata(metadata),
  };

  void supabase
    .from('product_events')
    .insert(payload)
    .then(({ error }) => {
      if (error && import.meta.env.DEV) {
        console.info('Produktlogg kunde inte sparas.', error.message);
      }
    });
}
