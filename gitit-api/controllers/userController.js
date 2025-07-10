const prisma = require("../models/prismaClient")

exports.getAllUsers = async (req, res) => {
  try {
    // This endpoint is already protected by the middleware
    // so we know the user is an admin
    const users = await prisma.User.findMany({
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password for security reasons
      }
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error fetching users");
  }
};

// Function to get current user's profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get user ID from the JWT token that was decoded in middleware
    const userId = req.user.userId;
    
    const user = await prisma.User.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
        provider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error fetching user profile");
  }
};