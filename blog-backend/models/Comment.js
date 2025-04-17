const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  blog:   { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:   { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);

// Why?
// Links each comment to a blog and a user (the author of the comment)

// Helps you show comments under each blog

// Enables comment moderation or filtering

