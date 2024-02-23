const express = require("express");
const router = express.Router();
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct } = require("../controller/productCtrl");

router.post("/", createProduct);
router.get("/:id", getProduct);
router.get("/", getAllProducts);
router.put("/:id", updateProduct)
router.delete("/:id", deleteProduct)

module.exports = router;