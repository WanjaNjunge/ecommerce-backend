const express = require("express");
const router = express.Router();
const { createCategory, updateCategory, getCategory, getAllCategory, deleteCategory } = require("../controller/categoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
router.get("/:id", getCategory);
router.get("/", getAllCategory);


module.exports = router;