const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    topic: String,
    author_id: {type: String, required: true},
    author: String,
    image_url: String,
    avatar_url: String,
    createdAt: { type: Number, required: true},
    updatedAt: {type: Number, default: new Date().getTime()}, 
});

module.exports = mongoose.models[process.env.postTable] || mongoose.model(process.env.postTable, postSchema);