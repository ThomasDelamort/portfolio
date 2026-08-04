import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool, init } from "./db.js";
import contactRoutes from "./routes/contact.route.js";

dotenv.config();

const app: Express = express();
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

init()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running at localhost: ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err.message);
    console.error("Check your database url.");
    process.exit(1);
  });
