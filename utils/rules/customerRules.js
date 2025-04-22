import { body } from "express-validator";

const canadianProvinces = [
  "AB", // Alberta
  "BC", // British Columbia
  "MB", // Manitoba
  "NB", // New Brunswick
  "NL", // Newfoundland and Labrador
  "NS", // Nova Scotia
  "ON", // Ontario
  "PE", // Prince Edward Island
  "QC", // Quebec
  "SK", // Saskatchewan
  "NT", // Northwest Territories
  "NU", // Nunavut
  "YT", // Yukon
];

export const customerValidationRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isString()
    .withMessage("Phone number must be a string"),
  body("street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required")
    .isString()
    .withMessage("Street must be a string"),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isString()
    .withMessage("City must be a string"),
  body("province")
    .trim()
    .notEmpty()
    .withMessage("Province is required")
    .isString()
    .withMessage("Province must be a string")
    .custom((value) => canadianProvinces.includes(value))
    .withMessage("Province must be a valid Canadian province abbreviation"),
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string")
    .custom((value) => value.toLowerCase() === "canada")
    .withMessage("Country must be Canada"),
  body("postalCode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required")
    .isString()
    .withMessage("Postal code must be a string")
    .toUpperCase()
    .isPostalCode("CA")
    .withMessage("Invalid Canadian postal code format"),
  body("password")
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
];

const customerUpdateValidationRules = [
  body("firstName")
    .optional()
    .trim()
    .isString()
    .withMessage("First name must be a string"),
  body("lastName")
    .optional()
    .trim()
    .isString()
    .withMessage("Last name must be a string"),
  body("email").optional().trim().isEmail().withMessage("Invalid email format"),
  body("phone")
    .optional()
    .trim()
    .isString()
    .withMessage("Phone number must be a string"),
  body("street")
    .optional()
    .trim()
    .isString()
    .withMessage("Street must be a string"),
  body("city")
    .optional()
    .trim()
    .isString()
    .withMessage("City must be a string"),
  body("province")
    .optional()
    .trim()
    .isString()
    .withMessage("Province must be a string")
    .custom((value) => canadianProvinces.includes(value))
    .withMessage("Province must be a valid Canadian province abbreviation"),
  body("country")
    .optional()
    .trim()
    .isString()
    .withMessage("Country must be a string")
    .custom((value) => value.toLowerCase() === "canada")
    .withMessage("Country must be Canada"),
  body("postalCode")
    .optional()
    .trim()
    .isString()
    .withMessage("Postal code must be a string")
    .toUpperCase()
    .isPostalCode("CA")
    .withMessage("Invalid Canadian postal code format"),
  body("password")
    .optional()
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
];

export { customerUpdateValidationRules };
export default customerValidationRules;
