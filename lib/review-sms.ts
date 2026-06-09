import type { BusinessType, Settings } from "@/lib/types";

export const BUSINESS_TYPE_OPTIONS: {
  value: BusinessType;
  label: string;
}[] = [
  { value: "tradie", label: "Trade & Home Services" },
  { value: "aesthetic", label: "Aesthetic & Wellness" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hair_salon", label: "Hair & Beauty" },
  { value: "dentist", label: "Dental Practice" },
  { value: "estate_agent", label: "Estate Agency" },
];

export const CONSENT_BUSINESS_TYPES: BusinessType[] = ["healthcare", "dentist"];

export const DEFAULT_SMS_TEMPLATES: Record<BusinessType, string> = {
  tradie:
    "Hi {{name}}, thanks for having us out today. How'd we do? Reply 1-5 ⭐",
  aesthetic:
    "Hi {{name}}, thank you for visiting us today. We'd love your feedback — reply with a rating from 1 to 5.",
  healthcare:
    "Hi {{name}}, thank you for your visit. If you're happy to share feedback, please reply with a rating from 1 to 5. Your response is voluntary.",
  hair_salon:
    "Hi {customer_name}, thanks for coming in today! We'd love to know how we did — reply with a rating from 1 to 5 ⭐",
  dentist:
    "Hi {customer_name}, thank you for your visit to {business_name}. If you're happy to share feedback, please reply with a rating from 1 to 5. Your response is voluntary.",
  estate_agent:
    "Hi {customer_name}, thank you for working with {business_name}. We'd really appreciate your feedback — reply with a rating from 1 to 5.",
};

export function isConsentBusinessType(type: BusinessType): boolean {
  return CONSENT_BUSINESS_TYPES.includes(type);
}

export function defaultConsentForBusinessType(
  newType: BusinessType,
  previousType: BusinessType,
  currentConsent: boolean
): boolean {
  if (!isConsentBusinessType(newType)) return false;
  if (isConsentBusinessType(previousType)) return currentConsent;
  return true;
}

export function getDefaultTemplateForBusinessType(
  businessType: BusinessType
): string {
  return DEFAULT_SMS_TEMPLATES[businessType] ?? DEFAULT_SMS_TEMPLATES.aesthetic;
}

export function isDefaultOrEmptyTemplate(template: string): boolean {
  const trimmed = template.trim();
  if (!trimmed) return true;
  return Object.values(DEFAULT_SMS_TEMPLATES).includes(trimmed);
}

export function resolveRatingSmsTemplate(settings: Settings): string {
  if (settings.rating_sms_template?.trim()) {
    return settings.rating_sms_template;
  }

  const businessType = settings.business_type ?? "aesthetic";
  return (
    DEFAULT_SMS_TEMPLATES[businessType] ?? DEFAULT_SMS_TEMPLATES.aesthetic
  );
}

export function personalizeReviewTemplate(
  template: string,
  vars: {
    name: string;
    review_link: string | null;
    business_name?: string;
  }
): string {
  const reviewLink = vars.review_link ?? "";
  const businessName = vars.business_name ?? "";

  return template
    .replace(/\{\{name\}\}/g, vars.name)
    .replace(/\{\{review_link\}\}/g, reviewLink)
    .replace(/\{customer_name\}/g, vars.name)
    .replace(/\{business_name\}/g, businessName);
}
