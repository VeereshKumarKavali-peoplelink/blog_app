const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    gender: String,
});

module.exports = mongoose.models[process.env.userTable] || mongoose.model(process.env.userTable, userSchema);