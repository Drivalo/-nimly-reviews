export type JobStatus =
  | "pending"
  | "complete"
  | "sms_sent"
  | "rated"
  | "review_received"
  | "reviewed"
  | "concern"
  | "complaint";

export interface Job {
  id: string;
  created_at: string;
  business_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  job_description: string | null;
  job_value: number | null;
  status: JobStatus;
  completed_at: string | null;
  rating: number | null;
  rating_received_at: string | null;
  feedback: string | null;
  review_requested_at: string | null;
  sequence_halted: boolean;
  consent_given: boolean;
  inngest_event_id: string | null;
}

export interface SmsLog {
  id: string;
  created_at: string;
  job_id: string | null;
  direction: "outbound" | "inbound";
  body: string;
  twilio_message_sid: string | null;
  from_number: string | null;
  to_number: string | null;
}

export type BusinessType =
  | "tradie"
  | "aesthetic"
  | "healthcare"
  | "hair_salon"
  | "dentist"
  | "estate_agent";

export interface Business {
  id: string;
  created_at: string;
  name: string;
  api_key: string;
}

export interface Settings {
  id: string;
  business_name: string;
  owner_name: string;
  owner_phone: string | null;
  google_review_link: string | null;
  rating_sms_template: string;
  delay_minutes: number;
  business_type: BusinessType;
  consent_required: boolean;
}
