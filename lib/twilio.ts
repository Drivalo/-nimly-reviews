import twilio from "twilio";

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Missing Twilio credentials");
  }

  return twilio(accountSid, authToken);
}

export function getTwilioPhoneNumber(): string {
  const phone = process.env.TWILIO_PHONE_NUMBER;
  if (!phone) {
    throw new Error("Missing TWILIO_PHONE_NUMBER");
  }
  return phone;
}

export function getBaseUrl(): string {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function sendSms(to: string, body: string) {
  const client = getTwilioClient();
  const from = getTwilioPhoneNumber();

  const message = await client.messages.create({ to, from, body });

  return {
    sid: message.sid,
    from: message.from,
    to: message.to,
  };
}

const WORD_TO_NUMBER: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
};

export function extractRating(body: string): number | null {
  const normalized = body.trim().toLowerCase();

  const wordMatch = WORD_TO_NUMBER[normalized];
  if (wordMatch) return wordMatch;

  const digitMatch = normalized.match(/([1-5])/);
  if (digitMatch) return parseInt(digitMatch[1], 10);

  return null;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

export function phonesMatch(a: string, b: string): boolean {
  const normA = a.replace(/\D/g, "");
  const normB = b.replace(/\D/g, "");
  return normA.endsWith(normB) || normB.endsWith(normA) || normA === normB;
}

export function personalizeTemplate(
  template: string,
  vars: { customer_name: string; owner_name: string; business_name: string }
): string {
  return template
    .replace(/\{customer_name\}/g, vars.customer_name)
    .replace(/\{owner_name\}/g, vars.owner_name)
    .replace(/\{business_name\}/g, vars.business_name);
}

export const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
