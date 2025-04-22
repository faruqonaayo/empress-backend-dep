// 3rd party imports
import { body } from "express-validator";

const collectionValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("products")
    .optional()
    .isArray()
    .withMessage("Products must be an array")
    .custom((products) => {
      if (!products.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Each product ID must be a valid ObjectId");
      }
      return true;
    }),
];

export default collectionValidationRules;
