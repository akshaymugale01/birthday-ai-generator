import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import MobileLayout from "../components/MobileLayout";
import { API_ENDPOINTS } from "../utils/baseUrl";

interface DetailsForm {
  birthdayPersonName: string;
  age: number | "";
  gender: "Male" | "Female" | "";
  mood: "Happy" | "Romantic" | "Funny" | "Motivational" | "Calm" | "";
  genre: "Rap" | "Rock" | "Pop" | "Desi" | "EDM" | "";
  singerVoice: "Male" | "Female" | "";
}

const moodOptions = [
  { id: "Happy", label: "Happy", icon: "/UI Images/Icons/Happy.png" },
  { id: "Romantic", label: "Romantic", icon: "/UI Images/Icons/Romantic.png" },
  { id: "Funny", label: "Funny", icon: "/UI Images/Icons/Funny.png" },
  {
    id: "Motivational",
    label: "Motivational",
    icon: "/UI Images/Icons/Motivational.png",
  },
  { id: "Calm", label: "Calm", icon: "/UI Images/Icons/Calm.png" },
];

const genreOptions = [
  { id: "Rap", label: "Rap", icon: "/UI Images/Icons/Rap.png" },
  { id: "Rock", label: "Rock", icon: "/UI Images/Icons/Rock.png" },
  { id: "Pop", label: "Pop", icon: "/UI Images/Icons/Pop.png" },
  { id: "Desi", label: "Desi", icon: "/UI Images/Icons/Desi.png" },
  { id: "EDM", label: "EDM", icon: "/UI Images/Icons/EDM.png" },
];

export default function Details() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<DetailsForm>({
    birthdayPersonName: "",
    age: "",
    gender: "",
    mood: "",
    genre: "",
    singerVoice: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTopShadow, setShowTopShadow] = useState(false);
  // Removed unused bottom shadow state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/register");
    }
  }, [userId, navigate]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop } = scrollContainerRef.current;

      setShowTopShadow(scrollTop > 10);
    }
  };
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      handleScroll();

      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [currentStep]);

  const handleNext = () => {
    console.log("handleNext called, currentStep:", currentStep, "form:", form);
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
      console.log("Step advanced to:", currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (
      !form.birthdayPersonName ||
      !form.age ||
      !form.gender ||
      !form.mood ||
      !form.genre ||
      !form.singerVoice
    ) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS?.song?.updateDetails, {
        userId,
        ...form,
      });

      if (response.data.success) {
        navigate("/lyrics", { state: { userId } });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.msg || "Failed to save details. Please try again."
        );
      } else {
        setError("Failed to save details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 relative">
              <h2 className="text-white text-xl font-bold mb-4">
                Tell us about your loved one...
              </h2>

              <div className="relative inline-block">
                <img
                  src="/UI Images/Cap&Gift.png"
                  alt="Birthday gift"
                  className="w-80 h-64 mx-auto relative z-10"
                />

                <img
                  src="/UI Images/Asset 1.png"
                  alt="Decorative asset"
                  className="absolute -top-4 -left-8 w-12 h-12 opacity-70 animate-pulse"
                />

                <img
                  src="/UI Images/Balloon.png"
                  alt="Balloon"
                  className="absolute top-8 -right-6 w-10 h-14 mr-2 opacity-80 animate-pulse"
                />

                <img
                  src="/UI Images/Purple tone.png"
                  alt="Music note"
                  className="absolute -bottom-2 -left-4 w-6 h-6 opacity-90 animate-pulse"
                />
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-col">
                <label className="text-white font-gibson font-semibold mb-2 block text-sm text-center">
                  Their name
                </label>
                <input
                  type="text"
                  placeholder="XXXXX XXXXXXXXX"
                  value={form.birthdayPersonName}
                  onChange={(e) =>
                    setForm({ ...form, birthdayPersonName: e.target.value })
                  }
                  className="w-full px-4 py-3 text-start rounded-full border-none outline-none text-gray-600 placeholder-gray-400 bg-white shadow-sm focus:shadow-md transition-all duration-200 text-sm font-gibson font-medium"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-white text-center font-gibson font-semibold mb-3 block">
                  How old they'll be this birthday
                </label>
                <div className="relative">
                  <select
                    value={form.age}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        age: e.target.value ? parseInt(e.target.value) : "",
                      })
                    }
                    className="w-full text-start px-6 py-4 rounded-full border-none outline-none text-gray-600 bg-white cursor-pointer shadow-sm focus:shadow-md transition-all duration-200 text-base font-gibson font-medium appearance-none"
                    required
                    aria-label="Select age"
                  >
                    <option value="">Select age</option>
                    {Array.from({ length: 80 }, (_, i) => i + 1).map((age) => (
                      <option key={age} value={age}>
                        {age} Years
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center space-x-2">
                    {form.age === "" ? (
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600"></div>
                    ) : (
                      <>
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-purple-600"></div>
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-white text-center font-gibson font-semibold mb-3 block">
                  Gender
                </label>
                <div className="relative">
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gender: e.target.value as "Male" | "Female",
                      })
                    }
                    className="w-full text-start px-6 py-4 rounded-full border-none outline-none text-gray-600 bg-white cursor-pointer shadow-sm focus:shadow-md transition-all duration-200 text-base font-gibson font-medium appearance-none"
                    required
                    aria-label="Select gender"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center space-x-2">
                    {form.gender === "" ? (
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600"></div>
                    ) : (
                      <>
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-purple-600"></div>
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-[#590b9d] rounded-2xl border-yellow-400 border shadow-lg overflow-hidden max-w-md mx-auto">
              <div className="bg-[#DDB678] py-2">
                <h3 className="text-[#49246A] font-bold text-center text-xl">
                  Mood
                </h3>
              </div>
              <div className="mt-4 p-4">
                <div className="grid grid-cols-5 gap-6">
                  {moodOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex flex-col items-center space-y-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            mood: option.id as DetailsForm["mood"],
                          })
                        }
                        className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform hover:scale-110
                          ${
                            form.mood === option.id
                              ? "bg-[#DDB678] ring-2 ring-white/50"
                              : "bg-white"
                          }`}
                      >
                        <img
                          src={option.icon}
                          alt={option.label}
                          className="w-7"
                        />
                      </button>
                      <span className="text-white text-xs text-center font-medium">
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Genre Section */}
            <div className="bg-[#590b9d] rounded-2xl border-yellow-400 border shadow-lg overflow-hidden max-w-md mx-auto">
              <div className="bg-[#DDB678] py-2">
                <h3 className="text-[#49246A] font-bold text-center text-xl">
                  Genre
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-5 gap-3">
                  {genreOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex flex-col items-center space-y-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            genre: option.id as DetailsForm["genre"],
                          })
                        }
                        className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform hover:scale-110
                          ${
                            form.genre === option.id
                              ? "bg-[#DDB678]"
                              : "bg-white"
                          }`}
                      >
                        <img
                          src={option.icon}
                          alt={option.label}
                          className="w-7"
                        />
                      </button>
                      <span className="text-white text-xs text-center font-medium">
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#590b9d] rounded-2xl border-yellow-400 border shadow-lg overflow-hidden max-w-md mx-auto">
              <div className="bg-[#DDB678] py-2">
                <h3 className="text-[#49246A] font-bold text-center text-xl">
                  Singer's voice
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, singerVoice: "Male" })}
                      className={`flex flex-col items-center justify-center w-28 h-14 rounded-lg transition-all duration-300 transform hover:scale-105
                        ${
                          form.singerVoice === "Male"
                            ? "bg-[#DDB678]"
                            : "bg-white"
                        }`}
                    >
                      <img
                        src="/UI Images/Icons/Male.png"
                        alt="Male"
                        className="w-8 h-12"
                      />
                    </button>
                    <span className="text-white text-xs text-center font-medium">
                      Male
                    </span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, singerVoice: "Female" })
                      }
                      className={`flex flex-col items-center justify-center w-28 h-14 rounded-lg transition-all duration-300 transform hover:scale-105
                        ${
                          form.singerVoice === "Female"
                            ? "bg-[#DDB678]"
                            : "bg-white"
                        }`}
                    >
                      <img
                        src="/UI Images/Icons/Female.png"
                        alt="Female"
                        className="w-8 h-12"
                      />
                    </button>
                    <span className="text-white text-xs text-center font-medium">
                      Female
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    let result;
    switch (currentStep) {
      case 0:
        result = form.birthdayPersonName && form.age && form.gender;
        break;
      case 1:
        result = form.mood && form.genre && form.singerVoice;
        break;
      default:
        result = false;
    }
    console.log(
      "canProceed - step:",
      currentStep,
      "result:",
      result,
      "form:",
      form
    );
    return result;
  };

  return (
    <MobileLayout step={(currentStep + 2) as 0 | 1 | 2 | 3 | 4 | 5}>
      <div className="flex-1 px-4 max-w-md mx-auto w-full overflow-hidden flex flex-col relative">
        {currentStep === 1 && (
          <div className="text-center mb-2 flex-shrink-0 bg-transparent">
            <h2 className="text-white text-xl font-bold mb-2">
              What would you like their song's vibe to be?
            </h2>
            <div className="relative inline-block">
              <img
                src="/UI Images/Headphone.png"
                alt="Headphones"
                className="w-52 mx-auto mb-4 opacity-100 relative z-10"
              />
              <img
                src="/UI Images/Purple Music Tone.png"
                alt="Music note"
                className="absolute -bottom-2 -left-4 w-8 h-8 opacity-90 animate-pulse"
              />
              <img
                src="/UI Images/Balloon2.png"
                alt="Balloon"
                className="absolute top-8 -right-6 w-10 h-14 opacity-80 animate-pulse"
              />
            </div>
          </div>
        )}
        {showTopShadow && (
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10 mx-4 rounded-t-lg" />
        )}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth"
        >
          <div className="pb-4">
            {renderStep()}
            {error && (
              <p className="text-red-300 text-sm text-center mt-4">{error}</p>
            )}
          </div>
        </div>
      </div>
      <div
        className="relative flex items-center justify-center mb-6"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="absolute inset-0 w-full h-full rounded-xl backdrop-blur-md z-0"></div>
        {currentStep < 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="relative z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-800 px-10 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 cursor-pointer pointer-events-auto"
          >
            Proceed
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="relative z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-800 px-10 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 cursor-pointer pointer-events-auto"
          >
            {loading ? "Processing..." : "Proceed"}
          </button>
        )}
      </div>
    </MobileLayout>
  );
}
