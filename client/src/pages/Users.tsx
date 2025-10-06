import { useState, useEffect } from "react";
import axios from "axios";
import MobileLayout from "../components/MobileLayout";
import { API_ENDPOINTS } from "../utils/baseUrl";

interface User {
  _id: string;
  birthdayPersonName: string;
  age: number;
  gender: string;
  mood: string;
  genre: string;
  singerVoice: string;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_ENDPOINTS.users}?page=${page}&limit=${usersPerPage}`);
      console.log("Response", response);
      
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "Failed to fetch users");
      } else {
        setError("Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <MobileLayout step={0} showTopBar={false}>
      <div className="flex-1 px-4 max-w-md mx-auto w-full overflow-hidden flex flex-col">
        <div className="text-center mb-6 pt-4">
          <h2 className="text-white text-xl font-bold mb-2">
            Registered Users
          </h2>
    
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-300 mx-auto mb-4"></div>
            <p className="text-white font-gibson text-lg">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {users.map((user, index) => (
                <div
                  key={user._id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold text-lg">
                      {user.birthdayPersonName}
                    </h3>
                    <span className="text-yellow-300 text-xs">
                      #{(currentPage - 1) * usersPerPage + index + 1}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-white">
                      <span className="text-yellow-300">Age:</span> {user.age}
                    </div>
                    <div className="text-white">
                      <span className="text-yellow-300">Gender:</span> {user.gender}
                    </div>
                    <div className="text-white">
                      <span className="text-yellow-300">Mood:</span> {user.mood}
                    </div>
                    <div className="text-white">
                      <span className="text-yellow-300">Genre:</span> {user.genre}
                    </div>
                    <div className="text-white">
                      <span className="text-yellow-300">Voice:</span> {user.singerVoice}
                    </div>
                    <div className="text-white">
                      <span className="text-yellow-300">Date:</span> {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 py-4" style={{ backgroundColor: "transparent" }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition-all duration-200"
              >
                ←
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? "bg-yellow-400 text-purple-800 font-bold"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition-all duration-200"
              >
                →
              </button>
            </div>

            <div className="text-center text-white/70 text-sm py-2">
              Page {currentPage} of {totalPages} • Showing {users.length} users
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
}