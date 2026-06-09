import { createServiceClient } from "@/lib/supabase";
import { sendSms, getTwilioPhoneNumber } from "@/lib/twilio";
import {
  resolveRatingSmsTemplate,
  personalizeReviewTemplate,
} from "@/lib/review-sms";
import type { Job, Settings } from "@/lib/types";

export type SendReviewResult =
  | { sent: true; job_id: string }
  | { sent: false; reason: string };

export async function sendReviewSms(jobId: string): Promise<SendReviewResult> {
  const supabase = createServiceClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return { sent: false, reason: "job_not_found" };
  }

  const typedJob = job as Job;

  if (typedJob.sequence_halted) {
    return { sent: false, reason: "sequence_halted" };
  }

  if (typedJob.status !== "complete") {
    return { sent: false, reason: "job_not_complete" };
  }

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .single();

  if (settingsError || !settings) {
    throw new Error("Settings not found");
  }

  const typedSettings = settings as Settings;

  if (typedSettings.consent_required && !typedJob.consent_given) {
    return { sent: false, reason: "consent_not_given" };
  }

  const template = resolveRatingSmsTemplate(typedSettings);
  const messageBody = personalizeReviewTemplate(template, {
    name: typedJob.customer_name,
    review_link: typedSettings.google_review_link,
  });

  const result = await sendSms(typedJob.customer_phone, messageBody);
  const now = new Date().toISOString();

  await supabase
    .from("jobs")
    .update({
      status: "sms_sent",
      review_requested_at: now,
    })
    .eq("id", jobId);

  await supabase.from("sms_log").insert({
    job_id: jobId,
    direction: "outbound",
    body: messageBody,
    twilio_message_sid: result.sid,
    from_number: result.from ?? getTwilioPhoneNumber(),
    to_number: result.to ?? typedJob.customer_phone,
  });

  return { sent: true, job_id: jobId };
}
