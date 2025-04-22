// 3rd party modules
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

// Custom modules
import Admin from "../models/admin.js";
import { validationResult } from "express-validator";
import serverResponse from "../utils/serverResponse.js";
import Customer from "../models/customer.js";

export async function createAdmin(req, res, next) {
  try {
    const { email, password } = req.body;

    const { errors } = validationResult(req);

    if (errors.length > 0) {
      return res.status(400).json({
        message: errors[0].msg,
      });
    }

    // Check if an admin already exists
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return serverResponse(res, 400, "Admin already exists", null);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    const savedAdmin = await admin.save();

    return serverResponse(res, 201, "Admin created", savedAdmin);
  } catch (error) {
    next(error);
  }
}

export async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return serverResponse(res, 400, "Invalid email or password", null);
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return serverResponse(res, 400, "Invalid email or password", null);
    }

    // Create and assign a token
    const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60,
    });

    return serverResponse(res, 200, "Login successful", {
      token: `Bearer ${token}`,
      user: {
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function checkAuth(req, res, next) {
  try {
    if (req.user?.role === "admin") {
      return serverResponse(res, 200, "Authenticated", {
        user: {
          email: req.user.email,
        },
      });
    } else if (req.user?.role === "customer") {
      const customer = await Customer.findById(req.user.id);

      if (!customer) {
        return serverResponse(res, 404, "Customer not found", null);
      }

      return serverResponse(res, 200, "Authenticated", {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: {
          street: customer.address.street,
          city: customer.address.city,
          province: customer.address.province,
          country: customer.address.country,
          postalCode: customer.address.postalCode,
        },
        cart: customer.cart || [],
      });
    }
    return serverResponse(res, 401, "Unauthorized", null);
  } catch (error) {
    next(error);
  }
}

// handler to create a customer
export async function createCustomer(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      province,
      country,
      postalCode,
      password,
      confirmPassword,
    } = req.body;

    const { errors } = validationResult(req);

    if (password !== confirmPassword) {
      errors.push({
        msg: "Passwords do not match",
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: errors[0].msg,
      });
    }

    // Check if the customer already exists
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return serverResponse(res, 400, "Customer already exists", null);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({
      firstName,
      lastName,
      email,
      phone,
      address: {
        street,
        city,
        province,
        country,
        postalCode,
      },
      password: hashedPassword,
    });

    const savedCustomer = await customer.save();

    const recipients = [customer.email];

    const transport = Nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
      })
    );

    const sender = {
      address: process.env.MAILTRAP_SENDER_EMAIL,
      name: process.env.MAILTRAP_SENDER_NAME,
    };

    transport.sendMail({
      from: sender,
      to: recipients,
      subject: "🎉 Welcome to Empress!",
      text: "Hey there!\n\nWe're so excited to have you join the Empress family. Your journey to elegance starts now! Explore our exclusive collection of handcrafted bracelets, designed just for you.\n\nHave any questions? We're here to help—just reply to this email!\n\nEnjoy your Empress experience! 💫\n\nCheers,\nThe Empress Team",
      category: "Integration Test",
    });

    return serverResponse(res, 201, "Customer created", savedCustomer);
  } catch (error) {
    next(error);
  }
}

// handler to login a customer
export async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return serverResponse(res, 400, "Invalid email or password", null);
    }

    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) {
      return serverResponse(res, 400, "Invalid email or password", null);
    }

    // Create and assign a token
    const token = jwt.sign({ _id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60,
    });

    return serverResponse(res, 200, "Login successful", {
      token: `Bearer ${token}`,
      user: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: {
          street: customer.address.street,
          city: customer.address.city,
          province: customer.address.province,
          country: customer.address.country,
          postalCode: customer.address.postalCode,
        },
        cart: customer.cart || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    // Generate a reset token
    const resetToken = jwt.sign({ _id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    const transport = Nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
      })
    );

    const sender = {
      address: process.env.MAILTRAP_SENDER_EMAIL,
      name: process.env.MAILTRAP_SENDER_NAME,
    };

    transport.sendMail({
      from: sender,
      to: email,
      subject: "Password Reset Request",
      text: `Hi ${customer.firstName},\n\nWe received a request to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nThe Empress Team`,
    });

    return serverResponse(res, 200, "Password reset email sent", null);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return serverResponse(res, 400, "Passwords do not match", null);
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return serverResponse(res, 400, "Invalid or expired token", null);
    }

    const customer = await Customer.findById(decoded._id);
    if (!customer) {
      return serverResponse(res, 404, "Customer not found", null);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the customer's password
    customer.password = hashedPassword;
    await customer.save();

    return serverResponse(res, 200, "Password reset successful", null);
  } catch (error) {
    next(error);
  }
}