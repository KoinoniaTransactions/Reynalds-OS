export const contactConfig = {
  businessName: "Koinonia Transactions",
  displayName: "Koinonia",
  email: "jeremiah@koinoniaadmin.com",
  phone: {
    display: "(719) 745-8497",
    href: "tel:+17197458497",
    isPlaceholder: false
  },
  sms: {
    display: "(719) 745-8497",
    href: "sms:+17197458497",
    isPlaceholder: false
  },
  responseTime: "We typically respond within one business day.",
  businessHours: "By appointment and active transaction need.",
  serviceArea: "Colorado real estate professionals",
  consultationSubject: "Koinonia Consultation Request",
  transactionSubject: "Active Transaction Support"
} as const;

export const socialConfig = {
  instagram: "",
  facebook: "",
  tiktok: ""
} as const;

export function mailto(subject?: string) {
  const encodedSubject = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${contactConfig.email}${encodedSubject}`;
}
