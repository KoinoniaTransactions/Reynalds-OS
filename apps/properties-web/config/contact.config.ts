export const contactConfig = {
  businessName: "Koinonia Properties",
  displayName: "Koinonia Properties",
  email: "jeremiah@koinoniaadmin.com",
  phone: {
    display: "(719) 745-8497",
    href: "tel:+17197458497"
  },
  sms: {
    display: "(719) 745-8497",
    href: "sms:+17197458497"
  },
  consultationSubject: "Koinonia Properties Inquiry",
  serviceArea: "Colorado property management inquiries"
} as const;

export function mailto(subject?: string) {
  const encodedSubject = subject
    ? `?subject=${encodeURIComponent(subject)}`
    : "";

  return `mailto:${contactConfig.email}${encodedSubject}`;
}
