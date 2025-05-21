const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const path = require("path");
const jwt = require("jsonwebtoken");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.post(
  "/signup",
  upload.single("profileImage"),
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 8 }).withMessage("Password too short"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    // console.log(email, password, "------");

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // console.log(existingUser, "------");
        return res.status(400).send("User already exists. Please login.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        email,
        password: hashedPassword,
        profileImage: req.file.filename,
      });

      await user.save();
      res.redirect("/login");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error during signup.");
    }
  }
);

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid credentials.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials.");

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.redirect(`/dashboard.html?token=${token}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

router.get("/api/profile", async (req, res) => {
  const authHeader = req.headers.authorization;

  // console.log(authHeader, "------");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "email profileImage"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      email: user.email,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
