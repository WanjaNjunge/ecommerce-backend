const express = require("express");
const router = express.Router();
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, rating, } = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/:id", getProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);


router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/", getAllProducts);

module.exports = router;