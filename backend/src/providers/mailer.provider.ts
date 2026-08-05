import { Resend } from "resend";
import type { ContactPayload } from "../types/mailer.types.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail({
  name,
  email,
  message,
}: ContactPayload) {
  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: process.env.MAIL_TO!,
    replyTo: email, // so replying goes to whoever messaged you
    subject: `New portfolio message from ${name}`,
    text: `${message}\n\nFrom: ${name} (${email})`,
    html: `
      <h2>New mail from portfolio</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
