import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import MobileLayout from "../components/MobileLayout";
import { API_ENDPOINTS } from "../utils/baseUrl";

export default function Lyrics() {
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songId, setSongId] = useState("");
  const [audioStatus, setAudioStatus] = useState("");
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/register");
      return;
    }

    const fetchLyrics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.post(API_ENDPOINTS.song.generateLyrics, {
          userId,
        });

        if (response.data.success) {
          setLyrics(response.data.lyrics);
          setSongId(response.data.songId);
        } else {
          setError("Failed to generate lyrics. Please try again.");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 429) {
            setError(
              "API limit exhausted. Please try again later or upgrade your plan."
            );
          } else {
            setError(
              err.response?.data?.msg ||
                "Failed to generate lyrics. Please try again."
            );
          }
        } else {
          setError("Failed to generate lyrics. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [userId, navigate]);

  const generateLyrics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(API_ENDPOINTS.song.generateLyrics, {
        userId,
      });

      if (response.data.success) {
        setLyrics(response.data.lyrics);
        setSongId(response.data.songId);
      } else {
        setError("Failed to generate lyrics. Please try again.");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError(
            "API limit exhausted. Please try again later or upgrade your plan."
          );
        } else {
          setError(
            err.response?.data?.msg ||
              "Failed to generate lyrics. Please try again."
          );
        }
      } else {
        setError("Failed to generate lyrics. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = async () => {
    if (!songId || !lyrics) {
      setError("No song available to play");
      return;
    }

    setAudioLoading(true);
    setIsPlaying(false);
    setError("");
    setAudioStatus("🎵 Generating your personalized audio...");

    try {
      const response = await axios.post(API_ENDPOINTS.song.generateAudio, {
        songId,
        lyrics,
      });

      if (response.data.success) {
        setAudioStatus("🎶 Audio ready! Starting playback...");

        if (response.data.useBrowserTTS && response.data.lyrics) {
          if ("speechSynthesis" in window) {
            setAudioStatus("🎤 Now playing with browser text-to-speech...");
            setIsPlaying(true);

            const utterance = new SpeechSynthesisUtterance(
              response.data.lyrics
            );
            utterance.rate = 0.8;
            utterance.pitch = 1.1;
            utterance.volume = 0.9;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice =
              voices.find(
                (voice) =>
                  voice.lang.startsWith("en") &&
                  voice.name.toLowerCase().includes("female")
              ) || voices.find((voice) => voice.lang.startsWith("en"));

            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }

            // Add event listeners to track when speech ends
            utterance.onend = () => {
              setIsPlaying(false);
              setAudioStatus("✅ Playback completed!");
              setTimeout(() => setAudioStatus(""), 3000);
            };

            utterance.onerror = () => {
              setIsPlaying(false);
              setAudioStatus("");
              setError("Speech playback failed. Please try again.");
            };

            window.speechSynthesis.speak(utterance);
          } else {
            setError(
              "Browser TTS not supported. Please configure ElevenLabs API key for music generation."
            );
            setIsPlaying(false);
            setAudioStatus("");
          }
        } else if (response.data.audioUrl && !response.data.useBrowserTTS) {
          setAudioStatus("🎵 Now playing high-quality AI-generated audio...");
          setIsPlaying(true);

          const audio = new Audio(response.data.audioUrl);
          setCurrentAudio(audio);

          // Add event listeners to track when audio ends
          audio.onended = () => {
            setIsPlaying(false);
            setCurrentAudio(null);
            setAudioStatus("✅ Playback completed!");
            setTimeout(() => setAudioStatus(""), 3000);
          };

          audio.onerror = () => {
            setIsPlaying(false);
            setCurrentAudio(null);
            setAudioStatus("");
            setError(
              "Audio playback failed. Please try again or check your internet connection."
            );
          };

          audio.play().catch(() => {
            setIsPlaying(false);
            setCurrentAudio(null);
            setAudioStatus("");
            setError(
              "Audio playback failed. Please try again or check your internet connection."
            );
          });
        } else {
          navigate("/player", {
            state: {
              userId,
              songId,
              audioData: response.data,
            },
          });
          setIsPlaying(false);
          setAudioStatus("");
        }
      } else {
        setError("Failed to generate audio. Please try again.");
        setIsPlaying(false);
        setAudioStatus("");
      }
    } catch (err) {
      setIsPlaying(false);
      setAudioStatus("");
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError(
            "API limit exhausted. Please try again later or upgrade your plan."
          );
        } else if (err.response?.status === 503) {
          setError(
            "Audio generation service temporarily unavailable. Please try again later."
          );
        } else {
          setError(
            err.response?.data?.msg ||
              "Failed to generate audio. Please try again."
          );
        }
      } else {
        setError("Failed to generate audio. Please try again.");
      }
    } finally {
      setAudioLoading(false);
    }
  };

  const handleStopSong = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }

    setIsPlaying(false);
    setAudioStatus("⏹️ Playback stopped");
    setTimeout(() => setAudioStatus(""), 2000);
  };

  if (loading) {
    return (
      <MobileLayout step={4}>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-300 mx-auto mb-4"></div>
            <p className="text-white font-gibson text-lg">
              Generating your personalized song...
            </p>
            <p className="text-yellow-300 font-gibson text-sm mt-2">
              This may take a moment
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout step={5}>
      <div className="flex-1 px-4 max-w-md mx-auto w-full overflow-hidden flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-white text-xl font-bold mb-4">
            Your song's lyrics are ready!
          </h2>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
            <button onClick={generateLyrics} className="mt-2 text-xs underline">
              Try Again
            </button>
          </div>
        )}

        {/* {audioStatus && (
          <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
            <div className="flex items-center space-x-2">
              {audioLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <p className="text-sm">{audioStatus}</p>
            </div>
          </div>
        )} */}

        {lyrics && (
          <div className="bg-white rounded-2xl p-6 mb-6 flex-1 overflow-y-auto shadow-lg">
            <pre className="text-purple-800 text-sm whitespace-pre-wrap leading-relaxed font-medium">
              {lyrics}
            </pre>
          </div>
        )}

        <div
          className="flex justify-center space-x-4 pb-4"
          style={{ backgroundColor: "transparent" }}
        >
          {isPlaying ? (
            <button
              onClick={handleStopSong}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 w-full font-bold text-sm transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>STOP SONG</span>
              </div>
            </button>
          ) : (
            <button
              onClick={async () => {
                if (audioLoading) return;
                await handlePlaySong();
              }}
              disabled={audioLoading || !lyrics || loading}
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-8 py-4 w-full font-bold text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed relative"
            >
              <div className="flex items-center justify-center space-x-2">
                {audioLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {audioLoading ? "GENERATING AUDIO..." : "PLAY SONG"}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
