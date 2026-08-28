// server.js
// Ye file poore backend ka "entry point" hai - jab Railway server start karega, ye file chalegi

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobRoutes from "./routes/jobRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Bade video files accept karne ke liye limit badhayi
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health check - ye check karne ke liye ki server zinda hai ya nahi
app.get("/", (req, res) => {
  res.json({ status: "ClipCraft backend chal raha hai ✅" });
});

// Sabhi job-related routes (upload, process, status check, download)
app.use("/api/jobs", jobRoutes);

app.listen(PORT, () => {
  console.log(`ClipCraft backend PORT ${PORT} par chal raha hai`);
});
