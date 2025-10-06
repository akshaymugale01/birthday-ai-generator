import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  birthdayPersonName: String,
  age: Number,
  gender: { type: String, enum: ['Male', 'Female'] },
  mood: { type: String, enum: ['Happy', 'Romantic', 'Funny', 'Motivational', 'Calm'] },
  genre: { type: String, enum: ['Rap', 'Rock', 'Pop', 'Desi', 'EDM'] },
  singerVoice: { type: String, enum: ['Male', 'Female'] },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
