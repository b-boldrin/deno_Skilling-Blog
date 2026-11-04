import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    unique: true
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  password: {
    type: String,
    required: true,
    select: false
  }

}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;