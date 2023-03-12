const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const signUpSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

signUpSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Signup", signUpSchema);
