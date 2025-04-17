const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  image:      { type: String }, // Optional blog image
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags:       [String], // Optional tags for search/filter
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);

// ✅ Why?
// Stores title, body content, and optional image

// author links to the User who wrote the blog

// tags help users filter/search blogs

// timestamps help you show "Published x days ago"