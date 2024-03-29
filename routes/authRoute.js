const express = require("express");
const { createUser, loginUser, getAllUsers, getUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getWishlist, saveAddress, userCart, getUserCart, createOrder, removeProductFromCart, updateCartProductQuantity, getMyOrders, getAllOrders, verifyUser, emptyCart } = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/verify-user", verifyUser);
router.post("/forgot-password-token", forgotPasswordToken)
router.put("/reset-password/:token", resetPassword);
// router.put("/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);

router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
// router.post("/cart/apply-coupon", authMiddleware, applyCoupon);
router.post("/cart/create-order", authMiddleware, createOrder);
router.get("/all-users", getAllUsers);
router.get("/get-all-orders", authMiddleware, isAdmin, getAllOrders);
router.get("/get-my-orders", authMiddleware, getMyOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:id", authMiddleware, isAdmin, getUser);

router.patch("/update-product-cart/:cartItemId", authMiddleware, updateCartProductQuantity);

router.delete("/delete-product-cart/:cartItemId", authMiddleware, removeProductFromCart);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteUser);

router.put("/edit-user", authMiddleware, updateUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);


module.exports = router;