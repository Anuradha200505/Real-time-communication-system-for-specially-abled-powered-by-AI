import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      
      <nav className="bg-[#1E293B] text-white px-6 py-4 flex justify-between">
        <h1 className="font-bold">AI Assistant</h1>
      </nav>

      <div className="flex flex-1 items-center justify-center text-center">
        <div>
          <h2 className="text-4xl text-[#2563EB] font-bold mb-4">
            AI Communication Assistant
          </h2>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Start Communication
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;