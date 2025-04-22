// 3rd party modules
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    itemsSold: {
      type: Number,
      required: true,
      default: 0,
    },
    revenue: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
    materials: {
      type: [String],
      required: true,
      default: [],
    },
    isVisible: {
      type: Boolean,
      required: true,
      default: true,
    },
    ratings: {
      type: [],
      required: true,
      default: [],
    },
    imagesUrl: {
      type: [],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
