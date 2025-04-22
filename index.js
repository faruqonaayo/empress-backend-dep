// 3rd party modules
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Custom modules
import serverResponse from "./utils/serverResponse.js";
import Admin from "./models/admin.js";

// Routes
import adminRoutes from "./routes/admin.js";
import customerRoutes from "./routes/customer.js";
import authRoutes from "./routes/auth.js";
import { checkAuthMiddleware } from "./utils/middleware.js";
import Customer from "./models/customer.js";

/**
 * Initializes and configures the Express application.
 */
const app = express();
const port = 5000;

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB_NAME,
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// custom middleware
// route to check if the request is authenticated
app.use(async (req, res, next) => {
  const adminIsAuthenticated = await checkAuthMiddleware(
    req,
    Admin,
    process.env.JWT_SECRET
  );
  const customerIsAuthenticated = await checkAuthMiddleware(
    req,
    Customer,
    process.env.JWT_SECRET
  );

  if (adminIsAuthenticated) {
    req.user = { ...adminIsAuthenticated, role: "admin" };

    return next();
  }

  if (customerIsAuthenticated) {
    req.user = { ...customerIsAuthenticated, role: "customer" };
  }
  next();
});

// Routes
app.get("/", (req, res) => {
  return serverResponse(res, 200, "Welcome to the API", null);
});

app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/auth", authRoutes);

// 404 route
app.use((req, res) => {
  return serverResponse(res, 404, "Route not found", null);
});

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  return serverResponse(res, 500, "Internal server error", null);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
