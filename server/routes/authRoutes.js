const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// =========================
// REGISTER
// =========================

router.post("/register", async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role,
    } = req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await User.create({

        name,

        email,

        password: hashedPassword,

        role,

      });

    res.status(201).json({

      success: true,

      message: "User Registered",

      user,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


// =========================
// LOGIN
// =========================

router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(400).json({

        success: false,

        message: "Invalid Email",

      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({

        success: false,

        message: "Invalid Password",

      });

    }

    const token =
      jwt.sign(

        {
          id: user._id,
          role: user.role,
        },

        "MY_SECRET_KEY",

        {
          expiresIn: "7d",
        }

      );

    res.status(200).json({

      success: true,

      token,

      role: user.role,

      name: user.name,

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});

module.exports = router;
