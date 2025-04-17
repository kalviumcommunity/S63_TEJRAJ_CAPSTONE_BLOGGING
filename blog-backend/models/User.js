const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

//  Why?
//Users can register, log in, and write blogs or comments

//We use timestamps to track createdAt & updatedAt

//Email and username are unique to prevent duplicate accounts