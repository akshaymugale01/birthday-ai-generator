import { useState } from "react";
import TopBar from "./TopBar";
import Menu from "./Menu";

type MobileLayoutProps = {
  children: React.ReactNode;
  step?: 0 | 1 | 2 | 3 | 4 | 5;
  showTopBar?: boolean;
  onMenuClick?: () => void;
};

export default function MobileLayout({
  children,
  step = 0,
  showTopBar = true,
  onMenuClick,
}: MobileLayoutProps) {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      setIsMenuOpen(true);
    }
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };
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

      <div
        className="md:hidden h-screen flex flex-col relative overflow-hidden"
        style={{
          backgroundImage: "url(/UI Images/BG.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <img
            src="/UI Images/Asset 1.png"
            alt="Decorative asset"
            className="absolute top-20 left-4 w-16 h-16 opacity-60"
          />

          <img
            src="/UI Images/Purple tone.png"
            alt="Music note"
            className="absolute bottom-32 left-6 w-8 h-8 opacity-80 animate-pulse"
          />

          <div className="absolute top-40 right-20 w-3 h-3 bg-yellow-200 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-12 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
        </div>

        {showTopBar && <TopBar step={step} onMenuClick={handleMenuClick} />}

        {showTopBar && (
          <div className="flex justify-center px-6 py-4">
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5].map((dotStep) => (
                <div
                  key={dotStep}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    dotStep <= step
                      ? "bg-yellow-400 shadow-md"
                      : "bg-white bg-opacity-30 border border-white border-opacity-50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col w-full overflow-hidden">
          {children}
        </div>
      </div>
      <Menu isOpen={isMenuOpen} onClose={handleMenuClose} />
    </>
  );
}
