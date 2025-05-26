import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./router/messageRouter.js";
import checkoutRouter from "./router/checkoutRouter.js";

const app = express();

dotenv.config({ path: "./config.env" });

console.log("Environment Variables:");
console.log("- FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("- PAYMENT_API_KEY exists:", !!process.env.PAYMENT_API_KEY);

const allowedOrigins = [
  process.env.FRONTEND_URL,  // Your Vercel frontend URL
  "http://localhost:5173",   // Vite dev server
  "http://localhost:3000"    // React dev server
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/message", messageRouter);
app.use("/api/v1", checkoutRouter);

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Server running",
    env_loaded: !!process.env.PAYMENT_API_KEY
  });
});

dbConnection();

export default app;
