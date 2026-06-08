import { inngest } from "../client";
import { createServiceClient } from "@/lib/supabase";
import {
  sendSms,
  personalizeTemplate,
  getTwilioPhoneNumber,
} from "@/lib/twilio";
import type { Job, Settings } from "@/lib/types";

export const sendRatingSms = inngest.createFunction(
  { id: "send-rating-sms", cancelOn: [{ event: "rating/cancel.sms", match: "data.jobId" }] },
  { event: "rating/send.sms" },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    const delayMinutes = await step.run("get-delay", async () => {
      const override = process.env.DELAY_OVERRIDE_MINUTES;
      if (override) return parseInt(override, 10);

      const supabase = createServiceClient();
      const { data } = await supabase
        .from("settings")
        .select("delay_minutes")
        .limit(1)
        .single();

      return data?.delay_minutes ?? 90;
    });

    await step.sleep("wait-before-sms", `${delayMinutes}m`);

    await step.run("send-sms", async () => {
      const supabase = createServiceClient();

      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (jobError || !job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      const typedJob = job as Job;

      if (typedJob.sequence_halted) {
        return { skipped: true, reason: "sequence_halted" };
      }

      const { data: settings } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      const typedSettings = settings as Settings;

      const body = personalizeTemplate(typedSettings.rating_sms_template, {
        customer_name: typedJob.customer_name,
        owner_name: typedSettings.owner_name,
        business_name: typedSettings.business_name,
      });

      const result = await sendSms(typedJob.customer_phone, body);

      await supabase.from("sms_log").insert({
        job_id: jobId,
        direction: "outbound",
        body,
        twilio_message_sid: result.sid,
        from_number: result.from ?? getTwilioPhoneNumber(),
        to_number: result.to ?? typedJob.customer_phone,
      });

      await supabase
        .from("jobs")
        .update({
          status: "sms_sent",
          review_requested_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return { sent: true };
    });
  }
);
