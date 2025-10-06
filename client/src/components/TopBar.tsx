import React from "react";

type TopBarProps = {
  step?: 0 | 1 | 2 | 3 | 4 | 5;
  onMenuClick?: () => void;
};

const stepToImage: Record<number, string> = {
  0: "/UI Images/progress bar.png",
  1: "/UI Images/progress bar1.png",
  2: "/UI Images/progress bar2.png",
  3: "/UI Images/progress bar3.png",
  4: "/UI Images/progress bar4.png",
  5: "/UI Images/progress bar5.png",
};

export default function TopBar({ step = 0, onMenuClick }: TopBarProps) {
  const progressSrc = stepToImage[step] ?? stepToImage[0];

  return (
    <div className="w-full bg-purple-900 bg-opacity-50 backdrop-blur-sm z-10">
      <div className="flex justify-between items-center px-4">
        <div className="flex flex-col items-start">
          <img src="/UI Images/Cadbury Logo.png" alt="Logo" className="w-20" />
        </div>
        <div className="flex-1 flex item-start">
          <img src="/UI Images/2d logo.png" alt="Logo" className="w-44" />
        </div>
        <button className="text-white" aria-label="Menu" onClick={onMenuClick}>
          <img
            src="/UI Images/Hamburger.png"
            alt="hamburger menu"
            className="w-10 h-6"
          />
        </button>
      </div>
    </div>
  );
}
