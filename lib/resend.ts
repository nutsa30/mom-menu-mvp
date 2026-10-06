import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

if (process.env.MOMMENU_SANDBOX === '1') {
  resend.emails.send = (async () => ({ data: { id: 'sandbox-email-not-sent' }, error: null, headers: null })) as typeof resend.emails.send;
}
