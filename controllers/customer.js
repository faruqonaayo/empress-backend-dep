// importing 3rd party libraries
import Product from "../models/product.js";
import Customer from "../models/customer.js";
import serverResponse from "../utils/serverResponse.js";
import Stripe from "stripe";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

// This function is used to get all products from the database
export async function getAllProducts(req, res, next) {
  try {
    const products = await Product.find({ isVisible: true, stock: { $gt: 0 } });
    return serverResponse(
      res,
      200,
      "Products retrieved successfully",
      products
    );
  } catch (error) {
    next(error);
  }
}

// This function is used to get a single product from the database
export async function getSingleProduct(req, res, next) {
  try {
    // Check if the product ID is valid
    const productId = mongoose.isValidObjectId(req.params.productId)
      ? req.params.productId
      : null;

    if (!productId) {
      return serverResponse(res, 400, "Invalid product ID", null);
    }

    // Find the product in the database
    const product = await Product.findOne({
      _id: productId,
      isVisible: true,
      stock: { $gt: 0 },
    });

    if (!product) {
      return serverResponse(res, 404, "Product not found", null);
    }
    return serverResponse(res, 200, "Product retrieved successfully", product);
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req, res, next) {
  try {
    if (req.user?.role !== "customer") {
      return serverResponse(res, 401, "Unauthorized access", null);
    }

    const customerId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
      return serverResponse(
        res,
        400,
        "Product ID and quantity are required",
        null
      );
    }
    // Check if the product exists
    const productExists = await Product.findById(productId);

    if (!productExists) {
      return serverResponse(res, 404, "Product not found", null);
    }

    // Check if the product is available in stock
    if (productExists.stock < quantity) {
      return serverResponse(res, 400, "Insufficient stock available", null);
    }

    // Check if the product is already in the cart
    const customerExists = await Customer.findById(customerId);

    if (!customerExists) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    const productInCart = customerExists.cart.find(
      (item) => item.productId.toString() === productId.toString()
    );

    console.log(productInCart);

    if (!productInCart) {
      // If the product is not in the cart, add it
      console.log("Product not in cart, adding it now");
      console.log(productId);

      customerExists.cart.push({ productId, quantity });
    } else {
      // If the product is already in the cart, update the quantity
      productInCart.quantity += quantity;
    }

    // Save the updated customer document
    await customerExists.save();

    return serverResponse(
      res,
      200,
      "Product added to cart successfully",
      customerExists.cart
    );
  } catch (error) {
    next(error);
  }
}

export async function getCart(req, res, next) {
  try {
    if (req.user?.role !== "customer") {
      return serverResponse(res, 401, "Unauthorized access", null);
    }

    const customerId = req.user.id;

    // Find the customer and populate the cart with product details
    const customer = await Customer.findById(customerId).populate(
      "cart.productId"
    );

    if (!customer) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    const cartWithProductDetails = customer.cart.map((item) => {
      return { ...item.productId._doc, quantity: item.quantity };
    });

    return serverResponse(
      res,
      200,
      "Cart retrieved successfully",
      cartWithProductDetails
    );
  } catch (error) {
    next(error);
  }
}

export async function updateCart(req, res, next) {
  try {
    if (req.user?.role !== "customer") {
      return serverResponse(res, 401, "Unauthorized access", null);
    }

    console.log(req.body);

    const customerId = req.user.id;
    const productId = req.params.productId;
    const { quantity, operation = "add" } = req.body;

    // Validate input
    if (!productId || !quantity || !operation) {
      return serverResponse(
        res,
        400,
        "Product ID, quantity, and operation are required",
        null
      );
    }

    if (!["add", "subtract"].includes(operation)) {
      return serverResponse(
        res,
        400,
        "Invalid operation. Use 'add' or 'subtract'.",
        null
      );
    }

    // Find the customer and update the cart
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    const productInCart = customer.cart.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (!productInCart) {
      return serverResponse(res, 404, "Product not found in cart", null);
    }

    if (operation === "add") {
      productInCart.quantity += quantity;
    } else if (operation === "subtract") {
      console.log("hello");

      productInCart.quantity -= quantity;
      if (productInCart.quantity <= 0) {
        customer.cart = customer.cart.filter(
          (item) => item.productId.toString() !== productId.toString()
        );
      }
    }

    // Save the updated customer document
    await customer.save();

    return serverResponse(res, 200, "Cart updated successfully", customer.cart);
  } catch (error) {
    next(error);
  }
}

export async function removeFromCart(req, res, next) {
  try {
    if (req.user?.role !== "customer") {
      return serverResponse(res, 401, "Unauthorized access", null);
    }

    const customerId = req.user.id;
    const productId = req.params.productId;

    // Validate input
    if (!productId) {
      return serverResponse(res, 400, "Product ID is required", null);
    }

    // Find the customer and remove the product from the cart
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    customer.cart = customer.cart.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    // Save the updated customer document
    await customer.save();

    return serverResponse(
      res,
      200,
      "Product removed from cart successfully",
      customer.cart
    );
  } catch (error) {
    next(error);
  }
}

export async function makePayment(req, res, next) {
  try {
    if (req.user?.role !== "customer") {
      return serverResponse(res, 401, "Unauthorized access", null);
    }

    const customerId = req.user.id;

    // Find the customer and process the payment
    const customer = await Customer.findById(customerId).populate(
      "cart.productId"
    );

    if (!customer) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    const session = await new Stripe(
      process.env.STRIPE_API_KEY
    ).checkout.sessions.create({
      line_items: [
        ...customer.cart.map((item) => {
          const unitAmount = (item.productId.price * 100).toFixed(0);
          return {
            price_data: {
              currency: "cad",
              product_data: {
                name: item.productId.name,
                images: [item.productId.image],
              },
              unit_amount: unitAmount,
            },
            quantity: item.quantity,
          };
        }),
      ],
      mode: "payment",
      success_url: `${process.env.YOUR_DOMAIN}?/products?success=true`,
      cancel_url: `${process.env.YOUR_DOMAIN}/cart?canceled=true`,
    });

    return serverResponse(res, 200, "Payment session created successfully", {
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomerDetails(req, res, next) {
  try {
    if (req.user?.role !== "customer") {
      return serverResponse(res, 401, "Unauthorized access", null);
    }

    const customerId = req.user.id;

    const { firstName, lastName, email, phone, street, city, province } =
      req.body;

    // Validate input
    const { errors } = validationResult(req);

    if (errors.length > 0) {
      return serverResponse(res, 400, errors[0].msg, null);
    }

    // Find the customer and update their details
    const customerExists = await Customer.findById(customerId);

    if (!customerExists) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    // check if email already exists in the database
    const emailExist = await Customer.findOne({
      email: email,
    });

    if (emailExist && emailExist._id.toString() !== customerId) {
      return serverResponse(res, 400, "Email already exists", null);
    }

    customerExists.firstName = firstName || customerExists.firstName;
    customerExists.lastName = lastName || customerExists.lastName;
    customerExists.email = email || customerExists.email;
    customerExists.phone = phone || customerExists.phone;
    customerExists.address.street = street || customerExists.address.street;
    customerExists.address.city = city || customerExists.address.city;
    customerExists.address.province =
      province || customerExists.address.province;
    customerExists.address.country =
      req.body.country || customerExists.address.country;
    customerExists.address.postalCode =
      req.body.postalCode || customerExists.address.postalCode;

    // Save the updated customer document

    await customerExists.save();

    return serverResponse(
      res,
      200,
      "Customer details updated successfully",
      customerExists
    );
  } catch (error) {
    next(error);
  }
}

export async function updateCustomerPassword(req, res, next) {
  try {
    if (req.user?.role !== "customer") {
      return serverResponse(res, 401, "Unauthorized access", null);
    }

    const customerId = req.user.id;
    const { newPassword, currentPassword } = req.body;

    // Validate input
    const { errors } = validationResult(req);

    if (errors.length > 0) {
      return serverResponse(res, 400, errors[0].msg, null);
    }

    // Find the customer and update their password
    const customerExists = await Customer.findById(customerId);

    if (!customerExists) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      customerExists.password
    );

    if (!passwordMatch) {
      return serverResponse(res, 400, "Current password is incorrect", null);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    customerExists.password = hashedPassword || customerExists.password;

    // Save the updated customer document
    await customerExists.save();

    return serverResponse(res, 200, "Customer password updated successfully", {
      firstName: customerExists.firstName,
      lastName: customerExists.lastName,
      email: customerExists.email,
      phone: customerExists.phone,
      address: {
        street: customerExists.address.street,
        city: customerExists.address.city,
        province: customerExists.address.province,
        country: customerExists.address.country,
        postalCode: customerExists.address.postalCode,
      },
      cart: customerExists.cart || [],
    });
  } catch (error) {
    next(error);
  }
}
