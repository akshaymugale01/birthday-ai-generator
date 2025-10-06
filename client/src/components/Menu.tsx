import { useNavigate } from "react-router-dom";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleReUsersClick = () => {
    navigate("/users");
    onClose();
  };

  const handleHomeClick = () => {
    navigate("/register");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-purple-900/95 backdrop-blur-md w-64 h-full shadow-2xl transform transition-transform duration-300 ease-in-out relative">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-xl font-bold">Menu</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-300 transition-colors duration-200"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-4">
            <button
              onClick={handleHomeClick}
              className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </button>

            <button
              onClick={handleReUsersClick}
              className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Registered-Users</span>
            </button>

            <div className="border-t border-white/20 my-4"></div>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center">
              <img
                src="/UI Images/Cadbury Logo.png"
                alt="Cadbury Logo"
                className="w-16 mx-auto mb-2 opacity-70"
              />
              <p className="text-white/50 text-xs">
                Birthday Song Generator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}