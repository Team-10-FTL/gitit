const express = require('express');
const userController = require("../controllers/userController"); // Add this line

const { authenticate, requireAdmin } = require('../middleware/authCheck'); 
const router = express.Router();

router.get("/profile", authenticate, userController.getUserProfile);
router.get("/users", authenticate, requireAdmin, userController.getAllUsers);

module.exports = router;