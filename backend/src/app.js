import express from 'express'
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from './utils/errorHandler.js';

const app = express()

// Middleware
app.use(cors({
  origin: 'https://rcpro.onrender.com', // ✅ only allow your frontend
  credentials: true // ✅ allow cookies
}));

app.use(express.json())

app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser())


// Routes

import adminRoutes from "./routes/admin.routes.js";
import ocrHandlerRoutes from "./routes/ocrHandler.routes.js";
import customerRoutes from "./routes/customer.routes.js"
import filterRoutes from "./routes/filter.routes.js"

// Routes declaration

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/ocr", ocrHandlerRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/fetch", filterRoutes);

app.use(errorHandler)

app.get('/health', (req, res) => {
  res.status(200).send('Backend is working!');
});

export { app }