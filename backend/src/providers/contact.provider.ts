import { pool } from "../db.js";
import type { ContactPayload } from "../types/mailer.types.js";

export async function createContact({ name, email, message }: ContactPayload) {
  const query = `
        INSERT INTO messages (name, email, message) 
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

  const values = [name, email, message];

  const result = await pool.query(query, values);

  return result.rows[0];
}
