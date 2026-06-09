import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";
import { phonesMatch } from "@/lib/twilio";
import type { Job } from "@/lib/types";

const MessagingResponse = twilio.twiml.MessagingResponse;

const WORD_TO_NUMBER: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
};

function parseRating(body: string): number | null {
  const trimmed = body.trim().toLowerCase();
  if (/^[1-5]$/.test(trimmed)) return parseInt(trimmed, 10);
  return WORD_TO_NUMBER[trimmed] ?? null;
}

function getWebhookUrl(request: NextRequest): string {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${request.nextUrl.pathname}`;
  }
  const baseUrl = process.env.BASE_URL;
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}${request.nextUrl.pathname}`;
  }
  return request.url;
}

function twimlResponse(message?: string) {
  const twiml = new MessagingResponse();
  if (message) {
    twiml.message(message);
  }
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

async function logInboundSms(
  jobId: string,
  body: string,
  from: string,
  to: string,
  messageSid: string | null
) {
  const supabase = createClient();
  await supabase.from("sms_log").insert({
    job_id: jobId,
    direction: "inbound",
    body,
    twilio_message_sid: messageSid,
    from_number: from,
    to_number: to,
  });
}

export async function POST(request: NextRequest) {
  try {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
      console.error("Missing TWILIO_AUTH_TOKEN");
      return new NextResponse("Server misconfigured", { status: 500 });
    }

    const signature = request.headers.get("X-Twilio-Signature") ?? "";
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const webhookUrl = getWebhookUrl(request);
    const isValid = twilio.validateRequest(
      authToken,
      signature,
      webhookUrl,
      params
    );

    if (!isValid) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const from = params.From ?? "";
    const to = params.To ?? "";
    const body = params.Body ?? "";
    const messageSid = params.MessageSid ?? null;

    const supabase = createClient();

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "sms_sent")
      .eq("sequence_halted", false)
      .order("review_requested_at", { ascending: false });

    const job = (jobs as Job[] | null)?.find(
      (j) => phonesMatch(j.customer_phone, from)
    );

    if (!job) {
      return twimlResponse();
    }

    const rating = parseRating(body);
    const now = new Date().toISOString();

    if (rating !== null) {
      await supabase
        .from("jobs")
        .update({
          rating,
          status: "review_received",
          rating_received_at: now,
        })
        .eq("id", job.id);

      await logInboundSms(job.id, body, from, to, messageSid);

      return twimlResponse(
        "Thank you for your rating! We really appreciate your feedback."
      );
    }

    await supabase
      .from("jobs")
      .update({
        feedback: body,
        status: "concern",
        sequence_halted: true,
      })
      .eq("id", job.id);

    await logInboundSms(job.id, body, from, to, messageSid);

    return twimlResponse(
      "Thank you for reaching out. We've received your message and will be in touch shortly."
    );
  } catch (error) {
    console.error("Twilio inbound webhook error:", error);
    return twimlResponse();
  }
}
