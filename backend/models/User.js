const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  musiliked_genres: [{ type: String }],
  musiliked_artistes: [{ type: String }],
  profilePicture: { type: String }, // URL or base64
  birthday: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
  isSinger: { type: Boolean, default: false },
  singerLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  isMusician: { type: Boolean, default: false },
  instruments: [{ name: String, category: String, level: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
