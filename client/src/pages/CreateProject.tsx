import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { User, Briefcase, Home, LogOut } from "lucide-react";

const CreateProject: React.FC = () => {
  const [user, setUser] = useState<{ name: string; avatar?: string } | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/users/user`, {
          withCredentials: true,
        });
        setUser({ name: response.data.username});
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/project/create-project`,
        { name, description },
        { withCredentials: true }
      );
      
      console.log("[CreateProject] Project Created:", response.data);

      // navigate("/builder", { state: { prompt } });

      navigate("/builder", { state: { 
        _id: response.data._id, 
        name: response.data.name, 
        description: response.data.description, 
        prompt 
      }});

      
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-900" style={{ backgroundImage: "url('./images/bg7.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      
      <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-400 animate-pulse" />
              <h1 className="ml-2 text-2xl font-bold text-white">Create New Project</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="/profile" className="flex items-center text-slate-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"> <Home className="w-4 h-4 mr-2" /> Dashboard </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4 relative">
            <span className="text-slate-300">{user?.name || "Guest"}</span>
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none hover:scale-105 transition-transform duration-300">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full border-2 border-blue-400 cursor-pointer hover:border-blue-300 transition-colors duration-300" />
                ) : (
                  <User className="h-10 w-10 p-2 rounded-full bg-slate-700 text-blue-400 cursor-pointer hover:bg-slate-600 transition-colors duration-300" />
                )}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-xl py-1 z-10 border border-slate-700 animate-fadeIn">
                  <button onClick={handleSignOut} className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors duration-300">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center h-screen relative bottom-8">
        <div className="absolute w-[430px] h-[520px]">
          <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-[#1845ad] to-[#23a2f6] rounded-full -top-20 -left-20"></div>
          <div className="absolute w-[200px] h-[200px] bg-gradient-to-r from-[#ff512f] to-[#f09819] rounded-full -bottom-20 -right-10"></div>
        </div>
        <form onSubmit={handleCreateProject} className="w-[400px] p-10 bg-white/10 backdrop-blur-md border border-white/10 shadow-lg rounded-lg">
          <h3 className="text-2xl font-semibold text-white text-center">Create a New Project</h3>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          <label className="block mt-6 text-white font-medium">Project Name</label>
          <input type="text" className="w-full mt-2 p-3 bg-white/10 text-white rounded" placeholder="Enter project name" value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="block mt-6 text-white font-medium">Project Description</label>
          <textarea className="w-full mt-2 p-3 bg-white/10 text-white rounded" placeholder="Enter project description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label className="block mt-6 text-white font-medium">Prompt</label>
          <textarea className="w-full mt-2 p-3 bg-white/10 text-white rounded" placeholder="Enter prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          <button type="submit" className="w-full mt-6 py-3 bg-white text-[#080710] font-semibold rounded" disabled={loading}>{loading ? "Creating..." : "Create Project"}</button>
          <button onClick={() => navigate("/profile")} className="mt-4 w-full text-white underline text-center">Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;