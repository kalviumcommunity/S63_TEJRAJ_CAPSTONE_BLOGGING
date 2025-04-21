const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  image:      { type: String },
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags:       [String], 
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
  
