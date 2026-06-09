import type { Settings } from "@/lib/types";

export const DEFAULT_SMS_TEMPLATES: Record<string, string> = {
  tradie:
    "Hi {{name}}, thanks for having us out today. How'd we do? Reply 1-5 ⭐",
  aesthetic:
    "Hi {{name}}, thank you for visiting us today. We'd love your feedback — reply with a rating from 1 to 5.",
  healthcare:
    "Hi {{name}}, thank you for your visit. If you're happy to share feedback, please reply with a rating from 1 to 5. Your response is voluntary.",
};

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
  vars: { name: string; review_link: string | null }
): string {
  const reviewLink = vars.review_link ?? "";

  return template
    .replace(/\{\{name\}\}/g, vars.name)
    .replace(/\{\{review_link\}\}/g, reviewLink)
    .replace(/\{customer_name\}/g, vars.name);
}
