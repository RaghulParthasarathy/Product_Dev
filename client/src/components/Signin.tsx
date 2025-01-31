import { useState } from "react";
import axios from "axios";

export default function AuthModal({ onClose }) {
  const [isSignIn, setIsSignIn] = useState(true); // Track if it's sign-in or sign-up mode
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
//   const [name, setName] = useState(""); // Only used in sign-up mode

  const handleAuth = async () => {
    try {
      const url = isSignIn
        ? "http://your-backend-url.com/api/signin"
        : "http://your-backend-url.com/api/signup"; // Change API endpoint

      const payload = isSignIn
        ? { email, password }
        : { email, password }; // Include name for sign-up

      const response = await axios.post(url, payload);

      console.log("Response:", response.data);
      alert(isSignIn ? "Login successful!" : "Sign Up successful!");

      // Optionally store token if authentication is successful
      // localStorage.setItem("token", response.data.token);

      onClose(); // Close the modal after success
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-20"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h2>

        {/* Show Name field only when signing up */}
        {/* {!isSignIn && (
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2 border rounded-md mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )} */}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded-md mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded-md mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-[#47128c] text-white py-2 rounded-md hover:bg-[#5e2aa6] transition"
          onClick={handleAuth}
        >
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>
        <div className="text-center mt-4">
          <button
            className="text-[#47128c] hover:underline"
            onClick={() => setIsSignIn(!isSignIn)}
          >
            {isSignIn ? "Go to Sign Up" : "Go to Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
