import type { Request, Response } from "express";
import axios from "axios";
import { Groq } from "groq-sdk";
import fs from "fs";
import path from "path";
import User from "../models/User.js";
import Song from "../models/Song.js";

export const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      birthdayPersonName,
      age,
      gender,
      mood,
      genre,
      singerVoice,
    } = req.body;

    if (
      !userId ||
      !birthdayPersonName ||
      !age ||
      !gender ||
      !mood ||
      !genre ||
      !singerVoice
    ) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { birthdayPersonName, age, gender, mood, genre, singerVoice },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update user details error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const generateLyrics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, msg: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const { birthdayPersonName, age, gender, mood, genre, singerVoice } = user;

    if (!birthdayPersonName || !age || !gender || !mood || !genre) {
      return res
        .status(400)
        .json({ success: false, msg: "User details incomplete" });
    }

    const prompt = `
    Wish a happy birthday to ${birthdayPersonName}.

    Ensure that "Happy birthday" is mentioned at least twice in the lyrics, and it should rhyme. The lyrics should use simple, short, and easy to pronounce words as much as possible.

    Using the above information, please write 16 lines of ${genre} lyrics that I can dedicate to ${
      gender === "Male" ? "him" : "her"
    } for ${
      gender === "Male" ? "his" : "her"
    } birthday. Each line can have maximum of 8 words or 40 characters.

    Additional context:
     Recipient's name: ${birthdayPersonName}
     Age they're turning: ${age}
     Song mood: ${mood}
     Music genre: ${genre}
     Singer voice: ${singerVoice}

    IMPORTANT REQUIREMENTS:
    - The lyrics generated should be completely unique and never written before
    - The lyrics generated should be completely unique and never written before
    - Should not infringe on any trademarks/copyrights or rights of any individual or entity
    - Avoid any references or similarity to existing lyrics of any song anywhere in the world
    - Avoid any mention of proper nouns (names or places) apart from ${birthdayPersonName}
    - Should not be insensitive or offensive to any person/place/caste/religion/creed/tribe/country/gender/government/organization
    - Completely avoid any words which might be construed as cuss words or offensive in any language
    - Use simple, easy-to-pronounce words
    - Make it rhyme naturally and lyrics propely
    - Include "Happy birthday" at least twice
    - Each line maximum 8 words or 40 characters
    - Total 16 lines
    - Match the ${mood} mood
    - Suitable for ${singerVoice} voice

    Generate only the lyrics, no additional text or formatting.
    `;

    console.log("Sending Propmpt - ", prompt);

    let lyrics;

    // For Static if failes to load authenticate dynamic apis
    const generateMockLyrics = () => {
      return `Happy birthday to you, ${birthdayPersonName}!
Another year of joy and cheer
Celebrating you today
${age} years of awesome here

Happy birthday, make a wish
Dancing like a happy fish
Friends around to celebrate
You're so cool, you're really great

Cake and candles, music loud
You should feel so very proud
Growing up but stay so sweet
Life with you is such a treat

Happy birthday once again
You're the best among all ${gender === "Male" ? "men" : "friends"}
May your dreams all come so true
This special day is just for you`;
    };

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "") {
      console.log("Using mock lyrics - Groq API key not configured");
      lyrics = generateMockLyrics();
      console.log("Mock lyrics:", lyrics);
    } else {
      try {
        console.log("Attempting to generate lyrics with Groq API...");
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are a creative songwriter specializing in personalized birthday songs. Generate only the lyrics without any additional formatting, explanations, or music notation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.8,
          max_tokens: 600,
          top_p: 1,
        });
        lyrics =
          chatCompletion.choices[0]?.message?.content || generateMockLyrics();
        console.log("Successfully generated lyrics with Groq API", lyrics);
      } catch (groqError: any) {
        console.error("Groq API failed:", groqError.message);
        console.log("Groq API error, using mock lyrics");
        lyrics = generateMockLyrics();
      }
    }

    // Create in DB
    const song = await Song.create({
      userId,
      birthdayPersonName,
      age,
      gender,
      mood,
      genre,
      singerVoice,
      lyrics,
      isGenerated: true,
    });
    res.json({ success: true, lyrics, songId: song._id });
  } catch (error) {
    console.error("Generate lyrics error:", error);
    res.status(500).json({ success: false, msg: "Error generating lyrics" });
  }
};

export const generateAudio = async (req: Request, res: Response) => {
  try {
    const { songId, lyrics } = req.body;

    if (!songId || !lyrics) {
      return res
        .status(400)
        .json({ success: false, msg: "Song ID and lyrics are required" });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ success: false, msg: "Song not found" });
    }

    let audioUrl = null;

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "") {
      console.log("Groq API key not configured - using mock audio");
      audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`;
    } else {
      try {
        console.log("Generating audio with Groq TTS API");
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });
        const response = await groq.audio.speech.create({
          model: "playai-tts",
          voice:
            song.singerVoice === "Female" ? "Arista-PlayAI" : "Fritz-PlayAI",
          input: `Here's your personalized birthday song! ${lyrics}`,
          response_format: "wav",
        });

        const audioDir = path.join(process.cwd(), "public", "audio");
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }

        const fileName = `${songId}.wav`;
        const filePath = path.join(audioDir, fileName);

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.writeFile(filePath, buffer);

        audioUrl = `${
          process.env.BASE_URL || "http://localhost:3000"
        }/audio/${fileName}`;
        console.log("Successfully generated audio with Groq TTS API");
      } catch (groqError: any) {
        console.error("Groq TTS API failed:", groqError.message);
        console.log("Using mock audio URL as fallback");
        audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`;
      }
    }

    await Song.findByIdAndUpdate(songId, { audioUrl });
    res.json({
      success: true,
      audioUrl,
      useBrowserTTS: audioUrl.includes("example.com"),
      lyrics: lyrics,
      message: audioUrl.includes("example.com")
        ? "Using browser TTS (Groq PlayAI terms not accepted yet)"
        : "Audio generated successfully with Groq TTS",
    });
  } catch (error) {
    console.error("Generate audio error:", error);
    res.status(500).json({ success: false, msg: "Error generating audio" });
  }
};
