import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { inngest } from "@/inngest/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const supabase = createServiceClient();

  // Public feedback submission (no auth required)
  if (body.feedback !== undefined && Object.keys(body).length <= 2) {
    const { data, error } = await supabase
      .from("jobs")
      .update({
        feedback: body.feedback,
        status: "complaint",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark complete flow
  if (body.action === "complete") {
    const { data: job, error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { ids } = await inngest.send({
      name: "rating/send.sms",
      data: { jobId: id },
    });

    if (ids[0]) {
      await supabase
        .from("jobs")
        .update({ inngest_event_id: ids[0] })
        .eq("id", id);
    }

    return NextResponse.json({ ...job, inngest_event_id: ids[0] ?? null });
  }

  // General update
  const { data, error } = await supabase
    .from("jobs")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(job);
}
