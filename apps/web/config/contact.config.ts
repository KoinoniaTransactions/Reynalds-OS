export const contactConfig = {
  businessName: "Koinonia Transactions",
  displayName: "Koinonia",
  email: "hello@koinoniatransactions.com",
  phone: {
    display: "Phone coming soon",
    href: "#phone-coming-soon",
    isPlaceholder: true
  },
  sms: {
    display: "Text coming soon",
    href: "#sms-coming-soon",
    isPlaceholder: true
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
