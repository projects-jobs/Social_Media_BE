const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  // Change: userId now references the "User" model
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  desc: { type: String, max: 500 },
  img: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      // Change: comment userId also references the "User" model
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);