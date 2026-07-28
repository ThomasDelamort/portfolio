import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import contactRoutes from "./routes/contact.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ ok: true, status: "up" });
});

app.get("/api/db-check", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    console.error("DB query failed:", err);
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// Routes
app.use("/api/contact", contactRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
