// import type { IconType } from "react-icons";

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  ok: boolean;
  message?: string;
  error?: string;
}
