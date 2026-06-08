import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // vars may already be set in the shell
  }
}

loadEnvFile();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running seed.");
  process.exit(1);
}

const supabase = createClient(url, key);

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const hoursAgo = (n: number) => {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
};

async function seed() {
  console.log("Seeding Lumière Spa demo data...");

  // Clear existing demo data (keep settings)
  await supabase.from("sms_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("jobs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const jobs = [
    // 2 pending
    {
      customer_name: "Sofia Laurent",
      customer_phone: "+61412345001",
      customer_email: "sofia.laurent@email.com",
      job_description: "Deep tissue massage — 60 min, focus on shoulders and lower back",
      job_value: 145,
      status: "pending",
      created_at: daysAgo(0),
    },
    {
      customer_name: "Priya Sharma",
      customer_phone: "+61412345002",
      customer_email: "priya.sharma@email.com",
      job_description: "Facial treatment — hydrating renewal with enzyme peel",
      job_value: 120,
      status: "pending",
      created_at: daysAgo(1),
    },
    // 2 complete (waiting for delay)
    {
      customer_name: "Emma Wilson",
      customer_phone: "+61412345003",
      customer_email: "emma.w@email.com",
      job_description: "Couples package — side-by-side massage with champagne",
      job_value: 380,
      status: "complete",
      completed_at: hoursAgo(2),
      created_at: daysAgo(2),
    },
    {
      customer_name: "Marcus Webb",
      customer_phone: "+61412345004",
      job_description: "Hot stone massage — 90 min full body relaxation",
      job_value: 165,
      status: "complete",
      completed_at: hoursAgo(1),
      created_at: daysAgo(2),
    },
    // 1 sms_sent
    {
      customer_name: "Lisa Nguyen",
      customer_phone: "+61412345005",
      customer_email: "lisa.n@email.com",
      job_description: "LED light therapy — anti-aging facial series, session 3 of 6",
      job_value: 95,
      status: "sms_sent",
      completed_at: daysAgo(1),
      review_requested_at: hoursAgo(3),
      created_at: daysAgo(3),
    },
    // 2 reviewed (5 stars)
    {
      customer_name: "Charlotte Davies",
      customer_phone: "+61412345006",
      customer_email: "charlotte.davies@email.com",
      job_description: "Waxing appointment — full leg and bikini line",
      job_value: 85,
      status: "reviewed",
      completed_at: daysAgo(4),
      review_requested_at: daysAgo(4),
      rating: 5,
      rating_received_at: daysAgo(3),
      sequence_halted: true,
      created_at: daysAgo(5),
    },
    {
      customer_name: "Rachel Torres",
      customer_phone: "+61412345007",
      customer_email: "rachel.t@email.com",
      job_description: "Aromatherapy relaxation massage — lavender and eucalyptus blend",
      job_value: 130,
      status: "reviewed",
      completed_at: daysAgo(6),
      review_requested_at: daysAgo(6),
      rating: 5,
      rating_received_at: daysAgo(5),
      sequence_halted: true,
      created_at: daysAgo(7),
    },
    // 1 complaint (2 stars, feedback filled)
    {
      customer_name: "Olivia Hart",
      customer_phone: "+61412345008",
      customer_email: "olivia.hart@email.com",
      job_description: "Microdermabrasion facial — brightening treatment",
      job_value: 175,
      status: "complaint",
      completed_at: daysAgo(3),
      review_requested_at: daysAgo(3),
      rating: 2,
      rating_received_at: daysAgo(2),
      feedback:
        "My appointment started 25 minutes late and the treatment room wasn't ready. The facial felt rushed and my skin was red and irritated for hours afterward.",
      sequence_halted: true,
      created_at: daysAgo(4),
    },
  ];

  const { data: insertedJobs, error: jobsError } = await supabase
    .from("jobs")
    .insert(jobs)
    .select();

  if (jobsError) {
    console.error("Failed to insert jobs:", jobsError.message);
    process.exit(1);
  }

  console.log(`Inserted ${insertedJobs.length} jobs`);

  const jobMap = Object.fromEntries(
    insertedJobs.map((j) => [j.customer_name, j.id])
  );

  const smsEntries = [
    // Lisa — sms_sent
    {
      job_id: jobMap["Lisa Nguyen"],
      direction: "outbound",
      body: "Hi Lisa, it's James from Lumière Spa. We just finished your job — hope everything looks great! Quick question: how would you rate our service today? Reply with a number: 1⭐ 2⭐ 3⭐ 4⭐ 5⭐",
      from_number: "+15551234567",
      to_number: "+61412345005",
      created_at: hoursAgo(3),
    },
    // Charlotte Davies — reviewed
    {
      job_id: jobMap["Charlotte Davies"],
      direction: "outbound",
      body: "Hi Charlotte, it's James from Lumière Spa. We just finished your job — hope everything looks great! Quick question: how would you rate our service today? Reply with a number: 1⭐ 2⭐ 3⭐ 4⭐ 5⭐",
      from_number: "+15551234567",
      to_number: "+61412345006",
      created_at: daysAgo(4),
    },
    {
      job_id: jobMap["Charlotte Davies"],
      direction: "inbound",
      body: "5",
      from_number: "+61412345006",
      to_number: "+15551234567",
      created_at: daysAgo(3),
    },
    {
      job_id: jobMap["Charlotte Davies"],
      direction: "outbound",
      body: "Thank you so much! 🙏 We really appreciate it. If you have a moment, it would mean the world to us if you could share that on Google — it only takes 30 seconds: https://g.page/r/lumiere-spa — James & the Lumière Spa team",
      from_number: "+15551234567",
      to_number: "+61412345006",
      created_at: daysAgo(3),
    },
    // Rachel Torres — reviewed
    {
      job_id: jobMap["Rachel Torres"],
      direction: "outbound",
      body: "Hi Rachel, it's James from Lumière Spa. We just finished your job — hope everything looks great! Quick question: how would you rate our service today? Reply with a number: 1⭐ 2⭐ 3⭐ 4⭐ 5⭐",
      from_number: "+15551234567",
      to_number: "+61412345007",
      created_at: daysAgo(6),
    },
    {
      job_id: jobMap["Rachel Torres"],
      direction: "inbound",
      body: "5⭐",
      from_number: "+61412345007",
      to_number: "+15551234567",
      created_at: daysAgo(5),
    },
    {
      job_id: jobMap["Rachel Torres"],
      direction: "outbound",
      body: "Thank you so much! 🙏 We really appreciate it. If you have a moment, it would mean the world to us if you could share that on Google — it only takes 30 seconds: https://g.page/r/lumiere-spa — James & the Lumière Spa team",
      from_number: "+15551234567",
      to_number: "+61412345007",
      created_at: daysAgo(5),
    },
    // Olivia Hart — complaint
    {
      job_id: jobMap["Olivia Hart"],
      direction: "outbound",
      body: "Hi Olivia, it's James from Lumière Spa. We just finished your job — hope everything looks great! Quick question: how would you rate our service today? Reply with a number: 1⭐ 2⭐ 3⭐ 4⭐ 5⭐",
      from_number: "+15551234567",
      to_number: "+61412345008",
      created_at: daysAgo(3),
    },
    {
      job_id: jobMap["Olivia Hart"],
      direction: "inbound",
      body: "2",
      from_number: "+61412345008",
      to_number: "+15551234567",
      created_at: daysAgo(2),
    },
    {
      job_id: jobMap["Olivia Hart"],
      direction: "outbound",
      body: "Thank you for letting us know — we're really sorry to hear that. We want to make this right. Could you tell us what happened? http://localhost:3000/feedback/[jobId]",
      from_number: "+15551234567",
      to_number: "+61412345008",
      created_at: daysAgo(2),
    },
    {
      job_id: jobMap["Olivia Hart"],
      direction: "outbound",
      body: "🚨 URGENT — Olivia Hart (+61412345008) rated you 2/5. Call them now to resolve before it goes public.",
      from_number: "+15551234567",
      to_number: "+61412345009",
      created_at: daysAgo(2),
    },
  ].map((entry) => {
    if (entry.body.includes("[jobId]")) {
      return {
        ...entry,
        body: entry.body.replace("[jobId]", jobMap["Olivia Hart"]),
      };
    }
    return entry;
  });

  const { error: smsError } = await supabase.from("sms_log").insert(smsEntries);

  if (smsError) {
    console.error("Failed to insert SMS logs:", smsError.message);
    process.exit(1);
  }

  console.log(`Inserted ${smsEntries.length} SMS log entries`);

  // Update settings with demo values
  const { data: settings } = await supabase
    .from("settings")
    .select("id")
    .limit(1)
    .single();

  if (settings) {
    await supabase
      .from("settings")
      .update({
        business_name: "Lumière Spa",
        owner_name: "James",
        owner_phone: "+61412345009",
        google_review_link: "https://g.page/r/lumiere-spa-review",
        delay_minutes: 90,
      })
      .eq("id", settings.id);
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
