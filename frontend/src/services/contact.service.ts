import type { ContactForm, ContactResponse } from "../types/contact.types.ts";

const API: string = import.meta.env.VITE_API_URL;

export async function sendContact(
  payload: ContactForm,
): Promise<ContactResponse> {
  const response = await fetch(`${API}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}
