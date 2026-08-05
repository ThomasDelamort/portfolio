import type { Request, Response } from "express";
import { createContact } from "../providers/contact.provider.js";
import { sendContactEmail } from "../providers/mailer.provider.js";

export async function submitContact(req: Request, res: Response) {
  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ ok: false, error: "All fields are required." });
  }

  let savedMessage;

  try {
    savedMessage = await createContact({
      name,
      email,
      message,
    });
  } catch (err) {
    console.error(" Failed to save message to database:", err);
  }

  try {
    await sendContactEmail({
      name,
      email,
      message,
    });
  } catch (err) {
    console.error(" Message saved but email failed to send:", err);
  }

  return res.status(201).json({
    ok: true,
    message: "Message sent successfully",
    data: savedMessage,
  });
}
