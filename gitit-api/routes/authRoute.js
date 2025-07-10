const express = require('express');
const controller = require("../controllers/authController");
const { authenticate, requireAdmin } = require('../middleware/authCheck'); 
const router = express.Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/createAdmin", controller.createAdmin);
router.post("/clerkSync", controller.clerkSync);




module.exports = router;