import "./App.css";

import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState("");

  const handleDeploy = async () => {
    setLoading(true);
    setDeployedUrl("");
    try {
      const { data } = await axios.post("http://localhost:9000/deploy", {
        githubUrl: url,
      });
      setDeployedUrl(data.url);
      setLoading(false);
    } catch (error) {
      console.error("Deployment failed:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212529] text-[#dee2e6] flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full bg-[#343a40] px-6 py-4 shadow-md">
        <div
          className="text-3xl font-extrabold text-[#f8f9fa] tracking-widest"
          style={{ fontFamily: "Courier New, monospace" }}
        >
          Deployify
        </div>
      </nav>

      {/* Centered Form */}
      <div className="flex justify-center items-center flex-grow w-[90%] md:w-[60%] xl:w-[40%] h-[450px] max-w-[500px]">
        <div
          className="bg-[#343a40] rounded-lg shadow-lg w-full p-6"
          // style={{ minHeight: "350px" }}
        >
          <h2 className="text-2xl font-bold text-[#f8f9fa] mb-6 text-center">
            Deploy Your Project
          </h2>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#dee2e6]">
                Your GitHub Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your GitHub URL"
                className="w-full mt-1 px-4 py-2 rounded-lg border border-[#495057] bg-[#212529] text-[#dee2e6] placeholder-[#6c757d] focus:ring-[#f8f9fa] focus:border-[#f8f9fa]"
              />
            </div>
            <button
              onClick={handleDeploy}
              disabled={loading}
              className={`flex items-center justify-center w-full px-4 py-2 font-medium rounded-lg text-[#212529] bg-[#f8f9fa] ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#dee2e6] hover:text-[#212529] transition"
              }`}
            >
              {loading ? (
                <svg
                  className="w-5 h-5 animate-spin text-[#212529]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Deploy"
              )}
            </button>
          </div>

          {/* Response */}
          {deployedUrl && (
            <p className="mt-6 text-sm text-center text-[#f8f9fa]">
              Your deployed link:{" "}
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#dee2e6] transition"
              >
                {deployedUrl}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
