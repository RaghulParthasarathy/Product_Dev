import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";
import axios from "axios";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // State variables
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const backendUrl = BACKEND_URL || "https://interiitps.onrender.com";

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = isSignUp
      ? `${backendUrl}/users/register`
      : `${backendUrl}/users/login`;

    const payload = isSignUp ? { username, email, password } : { email, password };

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        if (isSignUp) {
          setUsername("");
          setEmail("");
          setPassword("");
          alert("Sign up successful! Now click on the login button to log in!");
          setIsSignUp(false);
        } else {
          navigate("/Profile");
        }
      }
    } catch (error: any) {
      console.error("Fetch Error:", error);
      alert(error.response?.data?.error || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 overflow-hidden" 
    style={{
      backgroundImage: "url('/images/bg7.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
    >
      <div className="relative w-[430px] h-[520px]">
        <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-[#1845ad] to-[#23a2f6] rounded-full -top-20 -left-20"></div>
        <div className="absolute w-[200px] h-[200px] bg-gradient-to-r from-[#ff512f] to-[#f09819] rounded-full -bottom-20 -right-10"></div>
      </div>
      
      <form 
        onSubmit={handleSubmit} 
        className="absolute w-[400px] p-10 bg-white/10 backdrop-blur-md border border-white/10 shadow-lg rounded-lg"
      >
        <h3 className="text-2xl font-semibold text-white text-center">
          {isSignUp ? "Sign Up" : "Login Here"}
        </h3>
        
        {isSignUp && (
          <>
            <label className="block mt-6 text-white font-medium" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              id="username"
              className="w-full mt-2 p-3 bg-white/10 text-white rounded outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </>
        )}
        
        <label className="block mt-6 text-white font-medium" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          id="email"
          className="w-full mt-2 p-3 bg-white/10 text-white rounded outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <label className="block mt-6 text-white font-medium" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          id="password"
          className="w-full mt-2 p-3 bg-white/10 text-white rounded outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button
          className="w-full mt-6 py-3 bg-white text-[#080710] font-semibold rounded cursor-pointer"
          type="submit"
        >
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
        </button>
        
        <p className="mt-4 text-white text-center">
          {isSignUp ? (
            <>Already have an account? <span className="cursor-pointer underline" onClick={() => setIsSignUp(false)}>Log In</span></>
          ) : (
            <>Don't have an account? <span className="cursor-pointer underline" onClick={() => setIsSignUp(true)}>Sign Up</span></>
          )}
        </p>
      </form>
    </div>
  );
};

export default Login;