// 3rd party modules
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
    },
    authToken: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
