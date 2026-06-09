import { inngest } from "../client";
import { createServiceClient } from "@/lib/supabase";
import { sendReviewSms } from "@/lib/send-review-sms";

export const sendReviewOnJobCompleted = inngest.createFunction(
  { id: "send-review-on-job-completed" },
  { event: "reviews/job.completed" },
  async ({ event, step }) => {
    const { job_id } = event.data as { job_id: string };

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

    return step.run("send-review-sms", () => sendReviewSms(job_id));
  }
);
