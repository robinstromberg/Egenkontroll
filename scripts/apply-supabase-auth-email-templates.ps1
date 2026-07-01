param(
  [string] $ProjectRef = "eapjywbgxtudqjrlueep",
  [string] $TemplatesPath = "supabase/auth-email-templates.sv.json"
)

$ErrorActionPreference = "Stop"

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Error "SUPABASE_ACCESS_TOKEN saknas. Skapa en token i Supabase Dashboard > Account > Access Tokens och satt den i terminalen innan scriptet kors."
}

if (-not (Test-Path -LiteralPath $TemplatesPath)) {
  Write-Error "Hittar inte template-filen: $TemplatesPath"
}

$body = Get-Content -LiteralPath $TemplatesPath -Raw
$headers = @{
  Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN"
  "Content-Type" = "application/json"
}

$url = "https://api.supabase.com/v1/projects/$ProjectRef/config/auth"

Invoke-RestMethod -Method Patch -Uri $url -Headers $headers -Body $body | Out-Null

$config = Invoke-RestMethod -Method Get -Uri $url -Headers @{ Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN" }

[PSCustomObject]@{
  ProjectRef = $ProjectRef
  ConfirmationSubject = $config.mailer_subjects_confirmation
  MagicLinkSubject = $config.mailer_subjects_magic_link
  RecoverySubject = $config.mailer_subjects_recovery
  InviteSubject = $config.mailer_subjects_invite
  EmailChangeSubject = $config.mailer_subjects_email_change
  ReauthenticationSubject = $config.mailer_subjects_reauthentication
}
