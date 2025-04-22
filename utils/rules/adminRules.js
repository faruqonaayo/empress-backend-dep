import { body } from "express-validator";

const adminValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Password is required"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match");
      }
      return true;
    })
    .withMessage("Passwords must match"),
];

export default adminValidationRules;
