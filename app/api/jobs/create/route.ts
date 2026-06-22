import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7).trim();
  return token || null;
}

async function authenticateBusiness(request: NextRequest) {
  const apiKey = getBearerToken(request);
  if (!apiKey) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function POST(request: NextRequest) {
  const business = await authenticateBusiness(request);
  if (!business) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      job_description,
      job_value,
    } = body;

    if (!customer_name || !customer_phone) {
      return NextResponse.json(
        { error: "customer_name and customer_phone are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        business_id: business.id,
        customer_name: String(customer_name).trim(),
        customer_phone: String(customer_phone).trim(),
        customer_email: customer_email ? String(customer_email).trim() : null,
        job_description: job_description
          ? String(job_description).trim()
          : null,
        job_value:
          job_value !== undefined && job_value !== null && job_value !== ""
            ? parseFloat(String(job_value))
            : null,
        status: "pending",
        sequence_halted: false,
        consent_given: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Zapier job create error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
