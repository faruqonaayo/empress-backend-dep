// 3rd party modules
import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    itemsCount: {
      type: Number,
      required: true,
      default: 0,
    },
    products: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      required: true,
      default: [],
    },
    imageUrl: {
      type: {},
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Collection", collectionSchema);
