require("dotenv").config();
const app = require("../models/app")
const express = require("express")
const cors = require("cors")

app.use(cors())
app.use(express.json())

const authRoutes = require("../routes/authRoute");
const userRoutes = require("../routes/userRouter")

// const protectedRoutes = require("../routes/protected");

app.use("/auth", authRoutes); 
app.use("/user", userRoutes)
// app.use("/api", protectedRoutes);  


const PORT = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//   try {
//     res.send("Hello World");
//   } catch (error) {
//     console.log(error.message);
//   }
// });



app.listen(PORT, () => {
  try {
    console.log(`Server succesfully running on ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
