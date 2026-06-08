import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { sendRatingSms } from "@/inngest/functions/sendRatingSms";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendRatingSms],
});
