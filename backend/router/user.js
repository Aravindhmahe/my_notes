const express = require("express");
const jwt = require("jsonwebtoken");
const SignUp = require("../model/auth");
const brcrypt = require("bcrypt");

const router = express.Router();

router.post("/api/auth/signup", (req, res) => {
  brcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new SignUp({
      username: req.body.username,
      password: hash,
      email: req.body.email,
    });
    user
      .save()
      .then((result) => {
        res
          .status(201)
          .json({ message: "User saved successfully", result: result });
      })
      .catch((error) => {
        res.status(500).json({ error: error.errors });
      });
  });
});

router.post("/api/auth/login", (req, res) => {
  let loggedInUser;
  SignUp.findOne({ email: req.body.email })
    .then((user) => {
      loggedInUser = user;
      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      return brcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      const token = jwt.sign(
        {
          email: loggedInUser.email,
          userid: loggedInUser._id,
        },
        "secretKey",
        { expiresIn: "1h" }
      );
      return res.status(200).json({ token: token, expiresIn: 3600 });
    })
    .catch((error) => {
      return res.status(401).json({ message: "Authentication failed" + error });
    });
});

module.exports = router;
