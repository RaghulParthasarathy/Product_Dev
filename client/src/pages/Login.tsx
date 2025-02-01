import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";
import axios from "axios";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // State variables
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const backendUrl: string = BACKEND_URL || "https://interiitps.onrender.com";

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = isSignUp
      ? `${backendUrl}/users/register`
      : `${backendUrl}/users/login`;

    const payload = isSignUp ? { username, email, password } : { email, password };

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Is Sign Up:", isSignUp);

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Include cookies with the request
      });

      console.log("Response Status:", response.status); // Debugging log

      if (response.status === 200 || response.status === 201) {
        if (isSignUp) {
          setUsername("");
          setEmail("");
          setPassword("");
          alert("Sign up successful! Now click on the login button to log in!");
          navigate("/Login");
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
    <div className="flex flex-col justify-center items-center bg-[#ffffff] h-[100vh]">
      <div className="mx-auto flex w-full flex-col justify-center px-5 pt-0 md:h-[unset] md:max-w-[50%] lg:h-[100vh] min-h-[100vh] lg:max-w-[50%] lg:px-6">
        <a className="mt-10 w-fit text-black" href="/landing">
          <div className="flex w-fit items-center lg:pl-0 lg:pt-0 xl:pt-0">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 320 512"
              className="mr-3 h-[13px] w-[8px] text-black dark:text-black"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"></path>
            </svg>
            <p className="ml-0 text-sm text-black">Back to the website</p>
          </div>
        </a>
        <div className="text-center mt-10 text-4xl font-bold text-black">
          Welcome to our Website
        </div>
        <div className="flex justify-center items-center my-3">
          <div className="h-[1px] w-[65%] text-center bg-white"></div>
        </div>
        <div className="my-auto mb-auto mt-8 flex flex-col w-[350px] max-w-[450px] mx-auto md:max-w-[450px] lg:max-w-[450px]">
          <p className="text-[32px] font-bold text-black dark:text-black">
            {isSignUp ? "Sign Up" : "Log In"}
          </p>
          <p className="mb-2.5 mt-2.5 font-normal text-black dark:text-zinc-400">
            {isSignUp ? "Create your account!" : "Enter your email and password to log in!"}
          </p>
          <div className="mt-8">
            <form onSubmit={handleSubmit} className="pb-2">
              <div className="grid gap-2">
                {isSignUp && (
                  <>
                    <label className="text-black dark:text-black" htmlFor="username">
                      Username
                    </label>
                    <input
                      className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-zinc-400 focus:outline-0"
                      id="username"
                      placeholder="Username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </>
                )}
                <label className="text-black dark:text-black" htmlFor="email">
                  Email
                </label>
                <input
                  className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-zinc-400 focus:outline-0"
                  id="email"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label className="text-black" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-zinc-400 focus:outline-0"
                  required
                />
                <button
                  className="text-black whitespace-nowrap border border-zinc-200 bg-primary text-primary-foreground hover:bg-primary/90 mt-2 flex h-[unset] w-full items-center justify-center rounded-lg px-4 py-4 text-sm font-medium"
                  type="submit"
                >
                  {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
                </button>
              </div>
            </form>
            <p className="mt-4">
              {isSignUp ? (
                <span className="text-black">
                  Already have an account?
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="font-medium text-black text-sm ml-1"
                  >
                    Log In
                  </button>
                </span>
              ) : (
                <span className="text-black">
                  Don't have an account?
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="font-medium text-black text-sm ml-1"
                  >
                    Sign Up
                  </button>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
