const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true
    },
    billingInfo: {
      firstname: {
        type:String,
        required:true
      },
      lastname: {
        type:String,
        required:true
      },
      county: {
        type:String,
        required:true
      },
      city: {
        type:String,
        required:true
      },
      address: {
        type:String,
        required:true
      },
      pincode: {
        type:Number,
        required:true
      },
      phonenumber: {
        type:Number,
        required:true
      },
      email: {
        type:String,
        required:true
      },
      ordernotes: {
        type:String,
      },
      apartment: {
        type:String,
      },
    },
    paymentInfo: {
      mpesaOrderId: {
        type:String,
      },
      mpesaPaymentId: {
        type:String,
      }
    },
    orderItems: [
      {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required:true
      },
      quantity:{
        type: Number,
        required:true
      },
      price:{
        type: Number,
        required:true
      }
      }
    ],
    paidAt:{
      type: Date,
      default:Date.now(),
    },
    totalPrice:{
      type: Number,
      required: true
    },
    totalPriceAfterDiscount:{
      type: Number,
      required: true
    },
    orderStatus:{
      type: String,
      default: "Ordered"
    }
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);
