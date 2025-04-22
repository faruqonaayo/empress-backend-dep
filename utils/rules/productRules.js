// Used for validating product data
// 3rd party modules
import { body } from "express-validator";

const productValidationRules = [
  body("name").trim().isString().notEmpty().withMessage("Name is required"),
  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value > 0)
    .withMessage("Price must be greater than zero"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("description")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Description is required"),
  body("summary")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Summary is required"),

  body("isVisible").isBoolean().withMessage("isVisible must be a boolean"),
];

export default productValidationRules;
