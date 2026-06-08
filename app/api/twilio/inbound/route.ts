import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  extractRating,
  sendSms,
  phonesMatch,
  getBaseUrl,
  getTwilioPhoneNumber,
  EMPTY_TWIML,
} from "@/lib/twilio";
import type { Job, Settings } from "@/lib/types";

function twimlResponse() {
  return new NextResponse(EMPTY_TWIML, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

async function logSms(
  jobId: string,
  direction: "inbound" | "outbound",
  body: string,
  from: string | null,
  to: string | null,
  sid: string | null = null
) {
  const supabase = createServiceClient();
  await supabase.from("sms_log").insert({
    job_id: jobId,
    direction,
    body,
    twilio_message_sid: sid,
    from_number: from,
    to_number: to,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get("From")?.toString() ?? "";
    const body = formData.get("Body")?.toString() ?? "";
    const messageSid = formData.get("MessageSid")?.toString() ?? null;

    const rating = extractRating(body);

    const supabase = createServiceClient();

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "sms_sent")
      .order("review_requested_at", { ascending: false });

    const job = (jobs as Job[] | null)?.find((j) =>
      phonesMatch(j.customer_phone, from)
    );

    if (!job) {
      console.log(`No sms_sent job found for phone: ${from}`);
      return twimlResponse();
    }

    await logSms(job.id, "inbound", body, from, getTwilioPhoneNumber(), messageSid);

    if (rating === null) {
      return twimlResponse();
    }

    await supabase
      .from("jobs")
      .update({
        rating,
        rating_received_at: new Date().toISOString(),
        sequence_halted: true,
      })
      .eq("id", job.id);

    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    const typedSettings = settings as Settings;
    const baseUrl = getBaseUrl();
    const twilioFrom = getTwilioPhoneNumber();

    if (rating >= 4) {
      await supabase
        .from("jobs")
        .update({ status: "reviewed" })
        .eq("id", job.id);

      const reviewLink = typedSettings.google_review_link ?? "[review link not set]";
      const thankYouMsg = `Thank you so much! 🙏 We really appreciate it. If you have a moment, it would mean the world to us if you could share that on Google — it only takes 30 seconds: ${reviewLink} — ${typedSettings.owner_name} & the ${typedSettings.business_name} team`;

      const result = await sendSms(job.customer_phone, thankYouMsg);
      await logSms(
        job.id,
        "outbound",
        thankYouMsg,
        result.from ?? twilioFrom,
        result.to ?? job.customer_phone,
        result.sid
      );
    } else {
      await supabase
        .from("jobs")
        .update({ status: "complaint" })
        .eq("id", job.id);

      const feedbackUrl = `${baseUrl}/feedback/${job.id}`;
      const customerMsg = `Thank you for letting us know — we're really sorry to hear that. We want to make this right. Could you tell us what happened? ${feedbackUrl}`;

      const customerResult = await sendSms(job.customer_phone, customerMsg);
      await logSms(
        job.id,
        "outbound",
        customerMsg,
        customerResult.from ?? twilioFrom,
        customerResult.to ?? job.customer_phone,
        customerResult.sid
      );

      if (typedSettings.owner_phone) {
        const ownerMsg = `🚨 URGENT — ${job.customer_name} (${job.customer_phone}) rated you ${rating}/5. Call them now to resolve before it goes public. Feedback form: ${feedbackUrl}`;

        const ownerResult = await sendSms(typedSettings.owner_phone, ownerMsg);
        await logSms(
          job.id,
          "outbound",
          ownerMsg,
          ownerResult.from ?? twilioFrom,
          ownerResult.to ?? typedSettings.owner_phone,
          ownerResult.sid
        );
      }
    }

    return twimlResponse();
  } catch (error) {
    console.error("Twilio inbound webhook error:", error);
    return twimlResponse();
  }
}
