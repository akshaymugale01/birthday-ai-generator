import type { Request, Response } from "express";
import axios from "axios";
import { Groq } from "groq-sdk";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
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
        
        // Check if it's a rate limit error (429)
        if (groqError.response && groqError.response.status === 429) {
          return res.status(429).json({
            success: false,
            msg: "API limit exhausted. Please try again later or upgrade your plan."
          });
        }
        
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
    let useBrowserTTS = false;

    // Generate music prompt for ElevenLabs Music API
    const generateMusicPrompt = (
      lyrics: string,
      genre: string,
      mood: string,
      singerVoice: string
    ) => {
      const tempoMap: { [key: string]: string } = {
        Happy: "upbeat, energetic",
        Calm: "slow, peaceful",
        Romantic: "intimate, slow",
        Funny: "playful, bouncy",
        Motivational: "driving, powerful",
      };

      const instrumentMap: { [key: string]: string } = {
        Pop: "modern pop with synthesizers, electric guitar, drums, and bass",
        Rock: "electric guitars, powerful drums, bass guitar with rock energy",
        "Hip-Hop": "hip-hop beats, bass, electronic sounds, and urban style",
        Rap: "strong beats, bass-heavy production, and rhythmic backing",
        EDM: "electronic dance music with synthesizers, electronic beats, and drops",
        Desi: "traditional Indian instruments like tabla, sitar, harmonium, and ethnic percussion",
      };

      const tempo = tempoMap[mood] || "";
      const instruments =
        instrumentMap[genre] || "pop arrangement with guitar, piano, and drums";
      const vocalStyle =
        singerVoice === "Female" ? "female lead vocals" : "male lead vocals";

      const prompt = `Create birthday celebration song ans lyrics ${lyrics} gender ${vocalStyle}. 
      Musical style: ${tempo} ${genre} song with ${instruments}. 
      Include musical arrangements that complement the ${mood} mood.`;

      console.log("Music Prompt ================= :", prompt);
      return prompt;
    };

    if (
      !process.env.ELEVENLABS_API_KEY ||
      process.env.ELEVENLABS_API_KEY === ""
    ) {
      console.log("ElevenLabs API key not configured, trying Groq...");
    } else {
      console.log("ElevenLabs API Key status: Connected ---------");

      const elevenlabs = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
      });

      try {
        const musicPrompt = generateMusicPrompt(
          lyrics,
          song.genre,
          song.mood,
          song.singerVoice
        );

        console.log("musicPrompt Prompt =======================;", musicPrompt);
        const audioBuffer = await elevenlabs.music.compose({
          prompt: musicPrompt,
          musicLengthMs: 30000, // 30 Sec audio
        });

        console.log("audioBuffer Prompt =======================;", audioBuffer);

        const audioDir = path.join(process.cwd(), "public", "audio");
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }

        const fileName = `${songId}_elevenlabs.mp3`;
        const filePath = path.join(audioDir, fileName);

        await fs.promises.writeFile(filePath, audioBuffer);

        audioUrl = `${
          process.env.BASE_URL || "http://localhost:3000"
        }/audio/${fileName}`;

        console.log("Successfully generated music with ElevenLabs Music API");
      } catch (elevenLabsError: any) {
        console.error("ElevenLabs Music API failed with error:", {
          message: elevenLabsError.message,
          status: elevenLabsError.status,
          code: elevenLabsError.code,
          details:
            elevenLabsError.response?.data ||
            elevenLabsError.response ||
            "No additional details",
        });

        // Check if it's a rate limit error (429)
        if (elevenLabsError.response && elevenLabsError.response.status === 429) {
          return res.status(429).json({
            success: false,
            msg: "ElevenLabs API limit exhausted. Please try again later or upgrade your plan."
          });
        }

        if (
          elevenLabsError.message?.includes("bad_prompt") ||
          elevenLabsError.message?.includes("Terms of Service")
        ) {
          console.log(
            "🚫 ElevenLabs Music API: Prompt violated Terms of Service"
          );
          console.log("💡 Trying ElevenLabs Text-to-Speech instead...");
        }

        // Try ElevenLabs TTS as fallback before going to Groq
        try {
          console.log("Generating audio with ElevenLabs TTS API (fallback)");

          const getElevenLabsVoiceId = (singerVoice: string) => {
            const femaleVoices = [
              "EXAVITQu4vr4xnSDxMaL",
              "MF3mGyEYCl7XYWbV9V6O",
              "ThT5KcBeYPX3keUQqHPh",
            ];

            const maleVoices = [
              "pNInz6obpgDQGcFmaJgB",
              "VR6AewLTigWG4xSOukaG",
              "ErXwobaYiN019PkySvjV",
            ];

            const voices = singerVoice === "Female" ? femaleVoices : maleVoices;
            return voices[0];
          };

          const voiceId = getElevenLabsVoiceId(song.singerVoice);
          console.log("Using ElevenLabs TTS voice ID:", voiceId);
          console.log("Converting these exact lyrics to speech:");
          console.log("=".repeat(50));
          console.log(lyrics);
          console.log("=".repeat(50));

          const ttsBuffer = await elevenlabs.textToSpeech.convert(voiceId!, {
            text: lyrics,
            voiceSettings: {
              stability: 0.5,
              similarityBoost: 0.75,
            },
          });

          const audioDir = path.join(process.cwd(), "public", "audio");
          if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
          }

          const fileName = `${songId}_elevenlabs_tts.mp3`;
          const filePath = path.join(audioDir, fileName);

          await fs.promises.writeFile(filePath, ttsBuffer);

          audioUrl = `${
            process.env.BASE_URL || "http://localhost:3000"
          }/audio/${fileName}`;

          console.log("Successfully generated audio with ElevenLabs TTS API");
        } catch (ttsError: any) {
          console.error("ElevenLabs TTS also failed:", ttsError.message);
          
          // Check if it's a rate limit error (429)
          if (ttsError.response && ttsError.response.status === 429) {
            return res.status(429).json({
              success: false,
              msg: "ElevenLabs API limit exhausted. Please try again later or upgrade your plan."
            });
          }
          
          console.log("Falling back to Groq TTS API...");
        }
      }
    }

    // Fallback to Groq TTS if ElevenLabs failed
    if (
      !audioUrl &&
      process.env.GROQ_API_KEY &&
      process.env.GROQ_API_KEY !== ""
    ) {
      try {
        console.log("Generating audio with Groq TTS API");
        console.log("=".repeat(50));
        console.log("dynamic", lyrics);
        console.log("=".repeat(50));
        const apiKey = process.env.GROQ_API_KEY;
        const ttsUrl = "https://api.groq.com/openai/v1/audio/speech";
        const gorqTtsPayload = {
          model: "playai-tts",
          voice:
            song.singerVoice === "Female" ? "Arista-PlayAI" : "Fritz-PlayAI",
          input: lyrics,
          response_format: "wav",
        };

        const groqTtsResp = await axios.post(ttsUrl, gorqTtsPayload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        });

        const audioDir = path.join(process.cwd(), "public", "audio");
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }

        const fileName = `${songId}_groq.wav`;
        const filePath = path.join(audioDir, fileName);
        await fs.promises.writeFile(filePath, Buffer.from(groqTtsResp.data));

        audioUrl = `${
          process.env.BASE_URL || "http://localhost:3000"
        }/audio/${fileName}`;
        console.log("Successfully generated audio with Groq TTS API");
      } catch (groqError: any) {
        console.error("Groq TTS API failed:", groqError.message);
        
        // Check if it's a rate limit error (429)
        if (groqError.response && groqError.response.status === 429) {
          return res.status(429).json({
            success: false,
            msg: "API limit exhausted. Please try again later or upgrade your plan."
          });
        }
        
        console.log("Using browser TTS as final fallback");
        useBrowserTTS = true;
      }
    }

    // Final fallback - return error if no audio could be generated
    if (!audioUrl) {
      console.log("All audio generation methods failed");
      return res.status(503).json({
        success: false,
        msg: "Audio generation service temporarily unavailable. Please try again later."
      });
    }

    // Update song with audio URL if generated
    if (audioUrl) {
      await Song.findByIdAndUpdate(songId, { audioUrl });
    }

    res.json({
      success: true,
      audioUrl,
      useBrowserTTS,
      lyrics: lyrics,
      message: useBrowserTTS
        ? "Using browser TTS (Configure ElevenLabs API key for high-quality voice generation)"
        : audioUrl?.includes("elevenlabs") && audioUrl.includes("_tts")
        ? "Audio generated successfully with ElevenLabs TTS - speaking your exact lyrics with high-quality voice!"
        : audioUrl?.includes("elevenlabs")
        ? "Music generated successfully with ElevenLabs Music AI - full musical arrangement!"
        : "Audio generated successfully with Groq TTS - speaking your exact lyrics!",
    });
  } catch (error) {
    console.error("Generate audio error:", error);
    res.status(500).json({ success: false, msg: "Error generating audio" });
  }
};
