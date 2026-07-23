export const temporaryInspectorShareCopy = {
  eyebrow: 'VISA FÖR INSPEKTÖR',
  title: 'Dela dokumentationen',
  description: 'Skapa en tillfällig, skrivskyddad länk. Inspektören väljer själv vilken period som ska granskas. Länken gäller i 7 dagar.',
  action: 'Skapa inspektörslänk',
} as const;

export function readInspectorSharingCapabilities(canManageOrganization: boolean) {
  return {
    canCreateTemporaryLink: true,
    canManageLinks: canManageOrganization,
  } as const;
}
