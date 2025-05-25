import express from 'express'
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Or '*', but specific is better
  credentials: true // If you're using cookies
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

// Routes declaration

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/ocr", ocrHandlerRoutes);
app.use("/api/v1/customer", customerRoutes)


export { app }