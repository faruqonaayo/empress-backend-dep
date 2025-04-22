// 3rd party modules
import express from "express";
import formidable from "formidable";

// Custom modules
import * as adminControllers from "../controllers/admin.js";
import productValidationRules from "../utils/rules/productRules.js";
import collectionValidationRules from "../utils/rules/collectionRules.js";
import { checkAuthMiddleware } from "../utils/middleware.js";
import Admin from "../models/admin.js";

/*
 * The express.Router class can be used to create modular, mountable route handlers.
 */
const router = express.Router();

// Route to add a new product
router.post(
  "/product/new",
  async (req, res, next) => {
    await checkAuthMiddleware(req, Admin);
    next();
  },
  productValidationRules,
  adminControllers.postNewProduct
);

// Route to get all products
router.get("/products", adminControllers.getAllProducts);

// Route to get a single product
router.get("/product/:productId", adminControllers.getSingleProduct);

// Route to update a product
router.put(
  "/product/update/:productId",
  async (req, res, next) => {
    await checkAuthMiddleware(req, Admin);
    next();
  },
  productValidationRules,
  adminControllers.updateProduct
);

// Route to delete a product
router.delete("/product/delete/:productId", adminControllers.deleteProduct);

// Route to change the visibility of a product
router.put("/product/visibility/:productId", adminControllers.changeVisibility);

// Route to add a new material to a product
router.put("/product/add-material/:productId", adminControllers.addMaterial);

// Route to remove a material from a product
router.delete(
  "/product/remove-material/:productId",
  adminControllers.removeMaterial
);

// Route to add a product to a collection
router.put(
  "/product/add-to-collection/:productId",
  adminControllers.addToCollection
);

// Route to add new images to a product
router.put(
  "/product/add-images/:productId",
  (req, res, next) => {
    // Parse form data using formidable
    const form = formidable({
      uploadDir: "./public/temp",
      createDirsFromUploads: true,
      keepExtensions: true,
      maxFiles: 5,
      filter: ({ mimetype }) => {
        return mimetype.includes("image");
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return next(err);
      }

      req.files = files;
      next();
    });
  },
  adminControllers.putProductImage
);

// Route to remove an image from a product
router.delete(
  "/product/remove-image/:productId",
  adminControllers.removeProductImage
);

// route to add a new collection
router.post(
  "/collection/new",
  (req, res, next) => {
    // Parse form data using formidable
    const form = formidable({
      uploadDir: "./public/temp",
      createDirsFromUploads: true,
      keepExtensions: true,
      maxFiles: 1,
      filter: ({ mimetype }) => {
        return mimetype.includes("image");
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return next(err);
      }

      // extracting the fields data from the fields array
      const cleanReqBody = Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, value[0]])
      );

      req.body = cleanReqBody;
      req.files = files;

      next();
    });
  },
  async (req, res, next) => {
    await checkAuthMiddleware(req, Admin);
    next();
  },
  collectionValidationRules,
  adminControllers.postNewCollection
);

// Route to get all collections
router.get("/collections", adminControllers.getAllCollections);

// Route to get a single collection
router.get("/collection/:collectionId", adminControllers.getSingleCollection);

// Route to update a collection
router.put(
  "/collection/update/:collectionId",
  (req, res, next) => {
    // Parse form data using formidable
    const form = formidable({
      uploadDir: "./public/temp",
      createDirsFromUploads: true,
      keepExtensions: true,
      maxFiles: 1,
      filter: ({ mimetype }) => {
        return mimetype.includes("image");
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return next(err);
      }

      // extracting the fields data from the fields array
      const cleanReqBody = Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, value[0]])
      );

      req.body = cleanReqBody;
      req.files = files;

      next();
    });
  },
  async (req, res, next) => {
    await checkAuthMiddleware(req, Admin);
    next();
  },
  collectionValidationRules,
  adminControllers.updateCollection
);

// Route to delete a collection
router.delete(
  "/collection/delete/:collectionId",
  adminControllers.deleteCollection
);

// Route to add a product to a collection
router.put(
  "/collection/add-product/:collectionId",
  adminControllers.addProductToCollection
);

// Route to remove a product from a collection
router.delete(
  "/collection/remove-product/:collectionId",
  adminControllers.removeProductFromCollection
);

// Route to get all customers
router.get("/customers", adminControllers.getAllCustomers);

// Route to get a single customer
router.get("/customer/:customerId", adminControllers.getSingleCustomer);

// Route to delete a customer
router.delete("/customer/delete/:customerId", adminControllers.deleteCustomer);

// Route to get notifications for the admin
router.get("/notifications", adminControllers.getNotifications);

export default router;
