import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { API_ENDPOINTS } from "../utils/baseUrl";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    acceptTerms: false,
    receivePromo: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const handleOtpInputChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 4) {
      setOtpError("Please enter all 4 digits");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await axios.post(API_ENDPOINTS?.auth?.verifyOtp, {
        otp: otpValue,
        userId,
      });

      if (response.data.success) {
        navigate("/details", { state: { userId } });
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Form submission started with data:", form);

    if (!form.name || !form.email || !form.phone) {
      setError("All fields are required");
      console.log("Validation failed: missing fields");
      return;
    }

    if (!form.acceptTerms) {
      setError("Please accept terms and conditions");
      console.log("Validation failed: terms not accepted");
      return;
    }

    console.log("Validation passed, starting submission...");
    setLoading(true);

    try {
      console.log("Sending request to backend...");
      const res = await axios.post(API_ENDPOINTS.auth.register, form);
      console.log("Backend response:", res.data);

      if (res.data.success) {
        setUserId(res.data.user);
        setShowOtpModal(true);
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (axios.isAxiosError(err)) {
        console.error("Error response:", err.response?.data);
        setError(
          err.response?.data?.msg || "Registration failed. Please try again."
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobileLayout step={0}>
        <div className="flex-1 flex flex-col px-4 py-2 relative z-10 h-full max-h-screen overflow-hidden">
          <div className="relative flex justify-center mb-2">
            <div className="relative">
              <img
                src="/UI Images/Celebrations(Bg).png"
                alt="Birthday celebration"
                className="w-72 h-64 object-contain"
              />
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 text-yellow-300 text-sm">♪</div>
              </div>
            </div>
          </div>

          <h2 className="text-white font-gibson text-lg font-semibold mb-2 text-center tracking-wide">
            Register to create
          </h2>

          <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
            <form
              onSubmit={handleSubmit}
              onClick={() => console.log("Form clicked")}
              className="flex-1 flex flex-col space-y-2"
            >
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm({ ...form, phone: value });
                  }}
                  className={`w-full px-4 py-2.5 rounded-full border-2 outline-none text-gray-600 placeholder-gray-400 text-left bg-white shadow-sm focus:shadow-md transition-all duration-200 text-sm font-gibson ${
                    error && !form.phone
                      ? "border-red-300"
                      : "border-transparent focus:border-purple-400"
                  }`}
                  required
                  autoComplete="tel"
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => {
                    console.log("Name changed:", e.target.value);
                    setForm({ ...form, name: e.target.value });
                  }}
                  className={`w-full px-4 py-2.5 rounded-full border-2 outline-none text-gray-600 placeholder-gray-400 text-left bg-white shadow-sm focus:shadow-md transition-all duration-200 text-sm font-gibson ${
                    error && !form.name
                      ? "border-red-300"
                      : "border-transparent focus:border-purple-400"
                  }`}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email ID"
                  value={form.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, email: value });
                  }}
                  className={`w-full px-4 py-2.5 rounded-full border-2 outline-none text-gray-600 placeholder-gray-400 text-left bg-white shadow-sm focus:shadow-md transition-all duration-200 text-sm font-gibson ${
                    error && !form.email
                      ? "border-red-300"
                      : "border-transparent focus:border-purple-400"
                  }`}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2 mt-1 px-1">
                <label className="flex items-start text-white text-xs cursor-pointer font-gibson">
                  <div className="relative flex-shrink-0 mt-0.5 mr-2">
                    <input
                      type="checkbox"
                      checked={form.acceptTerms}
                      onChange={(e) => {
                        console.log(
                          "Terms checkbox changed:",
                          e.target.checked
                        );
                        setForm({ ...form, acceptTerms: e.target.checked });
                      }}
                      className="sr-only"
                      required
                    />
                    <div
                      className={`w-4 h-4 border-2 border-white rounded-full flex items-center justify-center ${
                        form.acceptTerms ? "bg-white/90" : "bg-transparent"
                      }`}
                    >
                      {form.acceptTerms && (
                        <div className="w-2 h-2 bg-purple-800 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className="leading-tight">
                    I accept Terms & Conditions and Privacy Policy of Mondelez
                    (Cadbury)
                  </span>
                </label>

                <label className="flex items-start text-white text-xs cursor-pointer font-gibson">
                  <div className="relative flex-shrink-0 mt-0.5 mr-2">
                    <input
                      type="checkbox"
                      checked={form.receivePromo}
                      onChange={(e) => {
                        console.log(
                          "Promo checkbox changed:",
                          e.target.checked
                        );
                        setForm({ ...form, receivePromo: e.target.checked });
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 border-2 border-white rounded-full flex items-center justify-center ${
                        form.receivePromo ? "bg-white/90" : "bg-transparent"
                      }`}
                    >
                      {form.receivePromo && (
                        <div className="w-2 h-2 bg-purple-800 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className="leading-tight">
                    I would like to receive promotional communication from
                    Mondelez (Cadbury) about its products and offers.
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-2 mt-2">
                  <p className="text-red-200 text-xs text-center font-gibson">
                    {error}
                  </p>
                </div>
              )}

              <div className="pt-3 flex justify-center mt-auto" style={{ backgroundColor: "transparent" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-40 bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-800 py-3 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-95 transition-all duration-200 font-gibson tracking-wide cursor-pointer pointer-events-auto relative z-50"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-2 pb-2 flex justify-center space-x-4">
            <div className="text-yellow-300 text-sm opacity-60">♪</div>
            <div className="text-yellow-300 text-base opacity-80">♫</div>
            <div className="text-yellow-300 text-sm opacity-60">♪</div>
          </div>
        </div>
        {showOtpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-10 mx-10 max-w-sm w-full shadow-2xl">
              <h2 className="text-purple-800 text-xl font-gibson font-bold text-center mb-4">
                Enter OTP
              </h2>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) =>
                        handleOtpInputChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-white text-xl font-gibson bg-purple-800 font-bold border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      maxLength={1}
                      placeholder=""
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-red-500 text-sm font-gibson text-center">
                    {otpError}
                  </p>
                )}

                <div className="text-end">
                  <button
                    type="button"
                    className="text-purple-700 font-bold font-gibson underline mb-4 cursor-pointer pointer-events-auto relative z-50"
                    onClick={() => alert("OTP: 1234")}
                  >
                    Resend OTP
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={otpLoading || otp.join("").length !== 4}
                    className="w-40 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-800 py-3 rounded-2xl font-gibson font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 cursor-pointer pointer-events-auto relative z-50"
                  >
                    {otpLoading ? "Verifying..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </MobileLayout>
    </>
  );
}
