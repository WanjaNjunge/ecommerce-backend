const Product  = require('../models/productModel');
const asyncHandler =  require('express-async-handler');
const slugify = require("slugify");
// const validateMongoDbId = require("../utils/validateMongodbId");

// Create  a new product
const createProduct = asyncHandler(async (req, res) => {
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const newProduct = await Product.create(req.body);
      res.json(newProduct);
    } catch (error) {
      throw new Error(error);
    }
  });

  // Get one product
const getProduct = asyncHandler(async (req, res) => {
const { id } = req.params;
// validateMongoDbId(id);
try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
} catch (error) {
    throw new Error(error);
}
});

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
    try {
      // Filtering
      const queryObj = { ...req.query };
      const excludeFields = ["page", "sort", "limit", "fields"];
      excludeFields.forEach((el) => delete queryObj[el]);

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
      let query = Product.find(JSON.parse(queryStr));
  
      // Sorting
  
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-createdAt");
      }
  
      // limiting the fields
  
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
      } else {
        query = query.select("-__v");
      }
  
      // pagination
  
      const page = req.query.page;
      const limit = req.query.limit;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
      if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) throw new Error("This page does not exist");
      }
      const product = await query;
      res.json(product);
    } catch (error) {
      throw new Error(error);
    }
  });


  // Update a product
  const updateProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateProduct);
      console.log({id})
    } catch (error) {
      throw new Error(error);
    }
  });

// delete a product
const deleteProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const deleteProduct = await Product.findByIdAndDelete(id, req.body, {
        new: true,
      });
      res.json({
        message: "Product deleted successfully",
        data: deleteProduct
      });
      console.log({id})
    } catch (error) {
      throw new Error(error);
    }
  });


module.exports = { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct }