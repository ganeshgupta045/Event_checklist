import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import ApiError from "./utils/ErrorHandeler.js";
import router from "./routes/index.js";

const app = express();

// ===== BASIC MIDDLEWARES =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "http://localhost:5173"
        : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());

// ===== API ROUTES =====
app.use("/api", router);

// ===== SERVE REACT BUILD =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../Client/dist")));


// React fallback (Express 5 safe)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../Client/dist/index.html"));
});


// ===== GLOBAL ERROR HANDLER (MUST BE LAST) =====
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
