// 3rd party modules
import express from "express";

// Custom modules
import * as customerControllers from "../controllers/customer.js";
import customerValidationRules, {
  customerUpdateValidationRules,
} from "../utils/rules/customerRules.js";
import { body } from "express-validator";

/*
 * The express.Router class can be used to create modular, mountable route handlers.
 */
const router = express.Router();

// route to get all products
router.get("/products", customerControllers.getAllProducts);

// route to add a product to the cart
router.post("/cart", customerControllers.addToCart);

// route to update a product in the cart
router.put("/cart/:productId", customerControllers.updateCart);

// route to get all products in the cart
router.get("/cart", customerControllers.getCart);

// route to remove a product from the cart
router.delete("/cart/:productId", customerControllers.removeFromCart);

// route to make a payment
router.post("/payment", customerControllers.makePayment);

// route to update customer details
router.put(
  "/update/details",
  customerUpdateValidationRules,
  customerControllers.updateCustomerDetails
);

// route to update customer password
router.put(
  "/update/password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ],
  customerControllers.updateCustomerPassword
);

export default router;
