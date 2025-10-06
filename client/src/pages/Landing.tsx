import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/register");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <div className="hidden md:flex min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 flex-col items-center justify-center px-8">
        <div className="text-center max-w-lg">
          <div className="flex flex-col items-center">
            <img
              alt="Cadbury Branding"
              src="/UI Images/Cadbury Logo.png"
              className=""
            />
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/UI Images/2d logo.png"
              alt="#MyBirthdayLogo"
              className=""
            />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-white font-gibson text-2xl font-bold mb-4">
              Mobile View Only
            </h2>
            <p className="text-white/80 font-gibson text-lg leading-relaxed">
              This birthday song generator is for mobile view only. This page is
              best viewed on a mobile device or with a mobile screen size.
              Please switch to a smartphone or resize your browser for the best
              experience.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-20 left-10 w-16 h-8 rounded-full opacity-100 animate-bounce pointer-events-none">
            <img src="/UI Images/Asset 1.png" alt="Asset1" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center z-10 px-6">
          <div className="relative">
            <img
              src="/UI Images/Celebrations(Bg) - hashtag.png"
              alt="Birthday celebration"
              className="w-96 object-contain"
            />
            <div className="absolute -top-4 -right-4">
              <img
                src="/UI Images/Purple Music Tone.png"
                alt="Music note"
                className="w-12 h-12 animate-bounce "
              />
            </div>
          </div>
          <p className="text-white text-lg font-gibson font-medium mb-2">
            A unique birthday song for everyone!
          </p>
          <p className="text-yellow-300 text-sm font-gibson mb-8">
            हर birthday, कुछ अलग हो आज, कुछ मीठा हो जाए
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute bottom-20 right-10 w-16 h-8 rounded-full opacity-100 animate-bounce delay-100 pointer-events-none">
            <img src="/UI Images/Asset 1.png" alt="Asset1" />
          </div>
          <div className="absolute bottom-40 left-20 w-6 h-6 bg-yellow-400 rounded-full opacity-80 animate-bounce delay-100 pointer-events-none"></div>
        </div>
      </div>
    </>
  );
}
