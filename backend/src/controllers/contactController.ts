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

  try {
    const savedMessage = await createContact({
      name,
      email,
      message,
    });

    await sendContactEmail({
      name,
      email,
      message,
    });

    return res.status(201).json({
      ok: true,
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (err) {
    console.log("Email failed", err);

    return res
      .status(500)
      .json({ ok: false, error: "Failed to submit message" });
  }
}
