import type { Request, Response } from "express";
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

  try {
    await sendContactEmail({ name, email, message });
    res.json({ ok: true, message: "Message sent!" });
  } catch (err) {
    console.log("Email failed", err);
    res.status(500).json({ ok: false, error: "Failed to send message" });
  }
}
