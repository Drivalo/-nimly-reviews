import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sendReviewSms } from "@/lib/send-review-sms";

const REASON_MESSAGES: Record<string, { message: string; status: number }> = {
  job_id_required: { message: "job_id required", status: 400 },
  job_not_found: { message: "Job not found", status: 404 },
  sequence_halted: { message: "SMS sequence halted for this job", status: 400 },
  job_not_complete: {
    message: "Job must be marked complete before sending review SMS",
    status: 400,
  },
  consent_not_given: { message: "Consent not given", status: 400 },
};

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const jobId = body.job_id as string | undefined;

    if (!jobId) {
      const err = REASON_MESSAGES.job_id_required;
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    const result = await sendReviewSms(jobId);

    if (!result.sent) {
      const err = REASON_MESSAGES[result.reason] ?? {
        message: result.reason,
        status: 400,
      };
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Send review SMS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send SMS" },
      { status: 500 }
    );
  }
}
