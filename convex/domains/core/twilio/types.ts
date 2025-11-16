export type BaseTwilioFunctionArgs = {
  accountSid: string;
  authToken: string;
};

export type SendWhatsAppMessageViaTwilioResponse = {
  account_sid: string;
  api_version: string;
  body: string;
  date_created: string;
  date_sent: string | null;
  date_updated: string;
  direction: string;
  error_code: number | null;
  error_message: string | null;
  from: string;
  messaging_service_sid: string | null;
  num_media: string;
  num_segments: string;
  price: number | null;
  price_unit: string;
  sid: string;
  status:
    | "queued"
    | "sending"
    | "sent"
    | "failed"
    | "delivered"
    | "undelivered"
    | "receiving"
    | "received"
    | "accepted"
    | "scheduled"
    | "read"
    | "partially_delivered"
    | "canceled";
  to: string;
};
