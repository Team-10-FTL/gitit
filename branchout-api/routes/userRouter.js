const express = require("express");
const userController = require("../controllers/userController");

const { authenticate, requireAdmin } = require("../middleware/authCheck");
const router = express.Router();
const { hybridAuth } = require("../middleware/authCheck");

router.get("/profile", authenticate, userController.getUserProfile);
router.get("/users", authenticate, requireAdmin, userController.getAllUsers);
router.get("/:id", authenticate, requireAdmin, userController.getUser);
router.get("/preferences", authenticate, userController.getPreferences);
router.put("/preferences", authenticate, userController.updateUser);
router.delete("/:id", authenticate, requireAdmin, userController.deleteUser);

module.exports = router;
