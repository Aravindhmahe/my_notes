const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");

router.post("/api/auth/signup", UserController.createUser);

router.post("/api/auth/login", UserController.loginUser);

module.exports = router;
