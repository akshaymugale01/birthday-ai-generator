import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  birthdayPersonName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  mood: { type: String, required: true },
  genre: { type: String, required: true },
  singerVoice: { type: String, required: true },
  lyrics: { type: String, required: true },
  audioUrl: String,
  isGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Song", songSchema);