// 3rd party modules
import express from "express";

// Custom modules
import * as authControllers from "../controllers/auth.js";
import adminValidationRules from "../utils/rules/adminRules.js";
import customerValidationRules from "../utils/rules/customerRules.js";

/*
 * The express.Router class can be used to create modular, mountable route handlers.
 */

const router = express.Router();

// Route to create an admin
router.post("/create/admin", adminValidationRules, authControllers.createAdmin);

// Route to login an admin
router.post("/login/admin", authControllers.loginAdmin);

// Route to check if the request is authenticated
router.get("/check/auth", authControllers.checkAuth);

// Route to create a customer
router.post(
  "/create/customer",
  customerValidationRules,
  authControllers.createCustomer
);

// Route to login a customer
router.post("/login/customer", authControllers.loginCustomer);

// Route for forgot password
router.post("/forgot/password", authControllers.forgotPassword);

// Route for reset password
router.post("/reset/password", authControllers.resetPassword);

export default router;
