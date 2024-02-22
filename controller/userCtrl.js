const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");


// Create a User ----------------------------------------------

const createUser = asyncHandler (async (req, res) => {
    /**
     * TODO:Get the email from req.body
     */
    const email = req.body.email;
    /**
     * TODO:With the help of email find the user exists or not
     */
    const findUser = await User.findOne({ email: email });
  
    if (!findUser) {
      /**
       * TODO:if user not found user create a new user
       */
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      /**
       * TODO:if user found then thow an error: User already exists
       */
      throw new Error("User Already Exists");
    }
  });

// Login a user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not
    const findUser = await User.findOne({ email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
      
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
  
  

  module.exports = { createUser, loginUser, getAllUsers, getUser, deleteUser, updateUser, blockUser, unblockUser }