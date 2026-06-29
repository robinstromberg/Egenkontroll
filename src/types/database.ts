export type OrganizationRole = 'owner' | 'admin' | 'staff';
export type MembershipStatus = 'active' | 'invited' | 'disabled';
export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
export type ControlCategory = 'temperature' | 'checklist' | 'receiving' | 'traceability' | 'round' | 'custom';
export type ControlFrequency = 'daily' | 'weekly' | 'per_delivery' | 'custom';
export type ControlRunStatus = 'draft' | 'completed' | 'completed_with_deviation';
export type ControlRunItemStatus = 'ok' | 'deviation' | 'not_applicable';
export type DeviationStatus = 'open' | 'resolved';
export type DeviationSeverity = 'low' | 'medium' | 'high';
export type ExportType = 'pdf' | 'csv';

export type Organization = {
  id: string;
  name: string;
  industry: 'food';
  business_type: 'restaurant' | 'cafe' | 'bakery' | 'kiosk' | 'foodtruck' | 'catering' | 'chilled_store' | null;
  logo_url: string | null;
  brand_color: string | null;
  logo_storage_bucket: string | null;
  logo_storage_path: string | null;
  logo_file_name: string | null;
  logo_content_type: string | null;
  logo_size_bytes: number | null;
  org_number: string | null;
  country_code: string;
  timezone: string;
  default_locale: string;
  subscription_status: 'inactive' | 'trial' | 'active' | 'past_due' | 'cancelled';
  billing_plan: 'monthly' | 'annual' | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationMembership = {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
};

export type OrganizationInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role: Exclude<OrganizationRole, 'owner'>;
  status: InvitationStatus;
  invited_by: string | null;
  accepted_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type ControlTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: ControlCategory;
  default_frequency: ControlFrequency;
  template_schema: Record<string, unknown>;
  locale: string;
  active: boolean;
  created_at: string;
};

export type ControlType = {
  id: string;
  organization_id: string;
  template_id: string | null;
  name: string;
  description: string | null;
  category: ControlCategory;
  frequency: ControlFrequency;
  frequency_config: Record<string, unknown>;
  instructions: string | null;
  active: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ControlObject = {
  id: string;
  organization_id: string;
  control_type_id: string;
  name: string;
  location: string | null;
  object_type: string | null;
  instructions: string | null;
  limit_min: number | null;
  limit_max: number | null;
  unit: string | null;
  metadata: Record<string, unknown>;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ControlFieldDefinition = {
  id: string;
  organization_id: string;
  control_type_id: string;
  field_key: string;
  label: string;
  field_type: 'text' | 'textarea' | 'number' | 'temperature' | 'boolean' | 'ok_not_ok' | 'date' | 'datetime' | 'photo' | 'select';
  required: boolean;
  deviation_rule: Record<string, unknown>;
  options: unknown[];
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: string;
  organization_id: string;
  name: string;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ControlRun = {
  id: string;
  organization_id: string;
  control_type_id: string;
  status: ControlRunStatus;
  performed_by: string | null;
  performed_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ControlRunItem = {
  id: string;
  organization_id: string;
  control_run_id: string;
  control_object_id: string | null;
  field_definition_id: string | null;
  object_snapshot: Record<string, unknown>;
  field_snapshot: Record<string, unknown>;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_date: string | null;
  value_json: Record<string, unknown>;
  status: ControlRunItemStatus;
  deviation_detected: boolean;
  deviation_reason: string | null;
  action_text: string | null;
  created_at: string;
};

export type Deviation = {
  id: string;
  organization_id: string;
  control_run_id: string;
  control_run_item_id: string | null;
  control_type_id: string | null;
  control_object_id: string | null;
  status: DeviationStatus;
  severity: DeviationSeverity;
  description: string;
  action_text: string;
  follow_up_comment: string | null;
  opened_by: string | null;
  resolved_by: string | null;
  opened_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};
