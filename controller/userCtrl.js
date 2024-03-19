require('dotenv').config();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");
const uniqid = require("uniqid");


// Create a User ----------------------------------------------

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });

  if (findUser) throw new Error("User Already Exists"); 

  try {
    const code = Math.random().toString(36).substring(2, 8); // Generate a random code

    const newUser = await User.create({ ...req.body, verificationCode: code });
    
    const verificationUrl = `
    <p>Hi ${newUser.username},</p>
    <p>Please use the following code to verify your sign up: <strong>${code}</strong>.</p>
    <p>Please follow this link to input the code for verification: <a href='${process.env.BASE_URL}/verify'>Click Here</a></p>
    <p>If you don't recognize this activity, please <a href='${process.env.BASE_URL}/forgot-password'>reset your password</a> immediately.</p>
    `;


    await sendEmail({
      to: email,
      subject: 'Registration Code',
      text: `Your registration code is: ${code}`,
      html: verificationUrl
    });

    res.json({ message: 'Verification code sent' });
  } catch (error) {
    throw new Error(error);
  }
  });


  // regisration code verification
  const  verifyCode = asyncHandler(async (req,res)=>{
    const { email, code } = req.body;
    

    const user = await User.findOne({ email: email });

    if(!user){
      throw new Error('Invalid Email Address');
    }else if(user.verificationCode!==code){
      throw new Error('Incorrect Verification Code')
    } else {
      res.json({ message: 'Verification successful' });
    }
  })

// Login a user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not
    const findUser = await User.findOne({ email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findUser?.id);
      const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        _id: findUser?._id,
        username: findUser?.username,
        email: findUser?.email,
        token: generateToken(findUser?._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  });

// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      username: findAdmin?.username,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});


// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate({ refreshToken }, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

  // Get all users

const getAllUsers = asyncHandler(async (req, res) => {
    try {
      const getUsers = await User.find();
      res.json(getUsers);
    } catch (error) {
      throw new Error(error);
    }
  });

// Get a single user

const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    
  
    try {
      const getUser = await User.findById(id);
      res.json({
        getUser
      });
    } catch (error) {
      throw new Error(error);
    }
  });

  // Delete a single user

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
  
    try {
      const deleteUser = await User.findByIdAndDelete(id);
      res.json({
        message: "User  has been deleted successfully",
        data: deleteUser
      });
    } catch (error) {
      throw new Error(error);
    }
  });

  // Update a user

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
      const updateUser = await User.findByIdAndUpdate(
        _id,
        {
          username: req?.body?.username,
          email: req?.body?.email,
        },
        {
          new: true,
        }
      );
      res.json(updateUser);
    } catch (error) {
      throw new Error(error);
    }
  });

  // Block user
  const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
  
    try {
      const blockUser = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: true,
        },
        {
          new: true,
        }
      );
      res.json({
        message: "User has been blocked successfully",
        data: blockUser
      });
    } catch (error) {
      throw new Error(error);
    }
  });
  

  // Unblock user
  const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
  
    try {
      const unblockUser = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: false,
        },
        {
          new: true,
        }
      );
      res.json({
        message: "User unblocked successfully",
        data: unblockUser
      });
    } catch (error) {
      throw new Error(error);
    }
  });

  // Update password
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json({
      message: "Password has been changed!",
      data: updatedPassword
    });
  } else {
    res.json(user);
  }
});
  
// Forget password link
  const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    try {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:3000/reset-password/${token}'>Click Here</a>`;
      const data = {
        to: email,
        subject: "Forgot Password Link",
        text: "Hey User",
        html: resetURL,
      };
      sendEmail(data);
      res.json(token);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error(" Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({
      message: "Password successfully reset! You can now login.",
      data: user
    });
  });
  
  const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
      const findUser = await User.findById(_id).populate("wishlist");
      res.json(findUser);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  // save user Address

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});


const userCart = asyncHandler(async (req, res) => {
  const { productId, quantity, price } = req.body;
  const {_id} = req.user;
  validateMongoDbId(_id);

  try {
    let newCart = await new Cart({
      userId:  _id,
      productId,
      quantity,
      price
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

  const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
  
    try {
      const cart = await Cart.find({ userId: _id }).populate(
        "productId"
      );
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user's cart" });
    }
  });

  const removeProductFromCart = asyncHandler(async (req, res)=>{
    const { _id } = req.user;
    const { cartItemId } = req.params
    validateMongoDbId(_id);
  
    try {
      const deleteProductFromCart = await Cart.deleteOne({ userId: _id, _id: cartItemId })
      res.json(deleteProductFromCart);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user's cart" });
    }

  });

  const updateCartProductQuantity = asyncHandler(async (req, res)=>{
    const { _id } = req.user;
    const { cartItemId } = req.params;
    const { newQuantity } = req.body;
    validateMongoDbId(_id);
  
    try {
      const cartItem = await Cart.findOneAndUpdate({ userId: _id, _id: cartItemId }, { quantity: newQuantity }, { new: true });
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item quantity" });
    }
});

  
const createOrder = asyncHandler(async (req, res) => {
  const { billingInfo, orderItems, totalPrice, totalPriceAfterDiscount } = req.body;
  const { _id } = req.user;

  try {
    const order = await  Order.create({
      billingInfo, orderItems, totalPrice, totalPriceAfterDiscount, user:_id
    })
    res.json({
      order,
      success: true
    })
  } catch (error) {
    throw new Error(error);
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  
  const { _id } = req.user;

  try {
    const orders = await  Order.find({user:_id
    }).populate("user").populate("orderItems.product")
    res.json({
      orders
    })
  } catch (error) {
    throw new Error(error);
  }
});
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("orderItems.product")
      .populate("user")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});
  // const emptyCart = asyncHandler(async (req, res) => {
  //   const { _id } = req.user;
  //   validateMongoDbId(_id);
  //   try {
  //     const user = await User.findOne({ _id });
  //     const cart = await Cart.findOneAndDelete({ orderby: user._id });
  //     res.json({
  //       message: "The cart has been emptied",
  //       data: cart,
  //     });
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // });
  
  // const applyCoupon = asyncHandler(async (req, res) => {
  //   const { coupon } = req.body;
  //   const { _id } = req.user;
  //   validateMongoDbId(_id);
  //   const validCoupon = await Coupon.findOne({ name: coupon });
  //   if (validCoupon === null) {
  //     throw new Error("Invalid Coupon");
  //   }
  //   const user = await User.findOne({ _id });
  //   let { cartTotal } = await Cart.findOne({
  //     orderby: user._id,
  //   }).populate("products.product");
  //   let totalAfterDiscount = (
  //     cartTotal -
  //     (cartTotal * validCoupon.discount) / 100
  //   ).toFixed(2);
  //   await Cart.findOneAndUpdate(
  //     { orderby: user._id },
  //     { totalAfterDiscount },
  //     { new: true }
  //   );
  //   res.json(totalAfterDiscount);
  // });
  
  // const createOrder = asyncHandler(async (req, res) => {
  //   const { COD, couponApplied } = req.body;
  //   const { _id } = req.user;
  //   validateMongoDbId(_id);
  //   try {
  //     if (!COD) throw new Error("Create cash order failed");
  //     const user = await User.findById(_id);
  //     let userCart = await Cart.findOne({ orderby: user._id });
  //     let finalAmount = 0;
  //     if (couponApplied && userCart.totalAfterDiscount) {
  //       finalAmount = userCart.totalAfterDiscount;
  //     } else {
  //       finalAmount = userCart.cartTotal;
  //     }
  
  //     let newOrder = await new Order({
  //       products: userCart.products,
  //       paymentIntent: {
  //         id: uniqid(),
  //         method: "COD",
  //         amount: finalAmount,
  //         status: "Cash on Delivery",
  //         created: Date.now(),
  //         currency: "ksh",
  //       },
  //       orderby: user._id,
  //       orderStatus: "Cash on Delivery",
  //     }).save();
  //     let update = userCart.products.map((item) => {
  //       return {
  //         updateOne: {
  //           filter: { _id: item.product._id },
  //           update: { $inc: { quantity: -item.count, sold: +item.count } },
  //         },
  //       };
  //     });
  //     const updated = await Product.bulkWrite(update, {});
  //     res.json({ message: "success" });
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // });
  
  // const getOrders = asyncHandler(async (req, res) => {
  //   const { _id } = req.user;
  //   validateMongoDbId(_id);
  //   try {
  //     const userorders = await Order.findOne({ orderby: _id })
  //       .populate("products.product")
  //       .populate("orderby")
  //       .exec();
  //     res.json(userorders);
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // });
  
  
  // const getOrderByUserId = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  //   validateMongoDbId(id);
  //   try {
  //     const userorders = await Order.findOne({ orderby: id })
  //       .populate("products.product")
  //       .populate("orderby")
  //       .exec();
  //     res.json(userorders);
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // });
  // const updateOrderStatus = asyncHandler(async (req, res) => {
  //   const { status } = req.body;
  //   const { id } = req.params;
  //   validateMongoDbId(id);
  //   try {
  //     const updateOrderStatus = await Order.findByIdAndUpdate(
  //       id,
  //       {
  //         orderStatus: status,
  //         paymentIntent: {
  //           status: status,
  //         },
  //       },
  //       { new: true }
  //     );
  //     res.json(updateOrderStatus);
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // });

  module.exports = { createUser, loginUser, getAllUsers, getUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getWishlist, saveAddress, userCart, getUserCart, createOrder, removeProductFromCart, updateCartProductQuantity, getMyOrders, getAllOrders, verifyCode }