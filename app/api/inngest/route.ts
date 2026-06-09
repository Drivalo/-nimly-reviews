import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { sendReviewOnJobCompleted } from "@/inngest/functions/sendReviewOnJobCompleted";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendReviewOnJobCompleted],
});
