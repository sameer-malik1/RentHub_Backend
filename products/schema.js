const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  images: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length >= 2 && arr.length <= 20;
      },
      message: "A product must have at least 2 images and at most 20 images.",
    },
  },
});

const Product = model("product", productSchema);
module.exports = Product;
