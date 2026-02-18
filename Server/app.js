import express from 'express';
import cors from 'cors';
import ApiError from './utils/ErrorHandeler.js';   // make sure filename matches
import router from './routes/index.js';
import cookieParser from 'cookie-parser';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || "http://localhost:5173"
      : "http://localhost:5173", // Can't use '*' with credentials: true
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies to be sent
  })
);
app.use(cookieParser());
// Routes
app.use('/api', router);

// Test route
app.get('/', (req, res) => {
  res.send('Hello World! from Express.js');
});


// Global Error Handler (must be last)
app.use((err, req, res, next) => {
  console.error(err);

  // Handle known ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Unknown error fallback
  return res.status(500).json({
    status: "error",
    message: err.message || 'Internal Server Error',
  });
});

export default app;

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build
app.use(express.static(path.join(__dirname, "../Client/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../Client/dist/index.html"));
});
