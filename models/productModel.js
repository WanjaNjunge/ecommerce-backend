const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      slug: {
        type: String,
        unique: true,
        lowercase: true,
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      sold: {
        type: Number,
        default: 0,
        select: false,
      },
      stock: {
        type: Number,
        default: 1,
        select: false,
      },
      images: [
        {
          public_id: String,
          url: String,
        },
      ],
      tags: {
        type: String,
        required: true,
      },
      ratings: [
        {
          star: Number,
          comment: String,
          postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
      totalrating: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  );

//Export the model
module.exports = mongoose.model('Product', productSchema);