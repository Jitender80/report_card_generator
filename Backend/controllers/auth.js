const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel"); // Adjust the path as needed

const signup = async (req, res) => {
  const { email, password, name,role} = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role
    });

    await newUser.save();

    res.status(201).json({ message: "User created", newUser });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error code
      res.status(400).json({ error: "User already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const role=existingUser.role;
    const token = jwt.sign({ userId: existingUser._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token,role });
  } catch (error) {
    console.log("error during login", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { signup, login };