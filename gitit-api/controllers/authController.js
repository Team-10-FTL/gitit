const bcrypt = require("bcrypt")
const prisma = require("../models/prismaClient")
const jwt = require("jsonwebtoken")

const hashPasswords = async(plainTextPassword) =>{
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainTextPassword, saltRounds)
    return hash
}

const comparePasswords = async(plainTextPassword, hashedPassword) =>{
    return bcrypt.compare(plainTextPassword, hashedPassword)
}

exports.login = async(req,res)=>{
    try {
        
        const {username, password} = req.body;

        if (!username) return res.status(401).send("Username required!")
        if (!password) return res.status(401).send("Password required!")


        const user = await prisma.User.findFirst({
            where: {userName: username}
        })

        if (!user) return res.status(401).send("User not found!")

        const isMatch = await comparePasswords(password, user.password)

        if (isMatch) {
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    userName: user.userName,
                    role: user.role 
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.status(200).json({ 
                message: "Login successful", 
                token: token,
                user: { 
                    id: user.id, 
                    userName: user.userName, 
                    email: user.email ,
                    role: user.role
                }
            });        
        }
        
        if (!isMatch) return res.status(401).send("Invalid credentials")

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Error during login")
    }

}

exports.createAdmin = async(req,res)=>{
  const { username, email, password, adminSecret } = req.body;
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).send("Endpoint not available");
  }

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).send("Invalid admin secret");
  }

  try {
    const hashedPassword = await hashPasswords(password)
    const user = await prisma.User.create({ 
        data: {
            userName: username, 
            email,  
            password: hashedPassword,
            provider: "local",
            role: "ADMIN" 
        } 
    });

    res.status(201).json({
      message: "Admin user successfully created",
      user: { 
        id: user.id, 
        userName: user.userName, 
        email: user.email, 
        role: user.role }
    })

  } catch (error) {
    console.log(error.message)
    res.status(500).send("Error creating admin user")
  }
}

exports.signup = async(req,res)=>{
  const { userName, email, password } = req.body;

  try {

    const hashedPassword = await hashPasswords(password)
    const user = await prisma.User.create({ 
        data: {
            userName, 
            email,  
            password: hashedPassword,
            provider: "local",
        } 
    });
    console.log(user)

    const token = jwt.sign(
      { 
        userId: user.id, 
        userName: user.userName,
        role: user.role,
        provider: user.provider // Add this to distinguish auth sources
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "User successfully created",
      token: token,
      user: { 
        id: user.id, 
        userName: user.userName, 
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).send("Error creating user")
  }
}


exports.clerkSync = async (req, res) => {
  const { clerkId, email, username } = req.body;

  console.log('🔄 Received clerkSync request:', { clerkId, email, username });


  try {
    // Check if user already exists
    const existingUser = await prisma.User.findFirst({
      where: { clerkId: clerkId }
    });
    
    if (existingUser) {
      console.log('✅ User already exists in database:', existingUser.id);
      return res.status(200).json({ 
        message: "User already exists",
        user: existingUser 
      });
    }
    
    // Create new user with Clerk data
    const user = await prisma.User.create({
      data: {
        clerkId: clerkId,
        userName: username,
        email: email,
        provider: "clerk",
        role: "USER"
      }
    });
    
    console.log('✅ New user created in database:', user.id);
    
    res.status(201).json({
      message: "User synced successfully",
      user: { 
        id: user.id, 
        userName: user.userName, 
        email: user.email,
        role: user.role,
        clerkId: user.clerkId
      }
    });
    
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error syncing user");
  }
};

