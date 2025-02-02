import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

const CreateProject: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

      navigate("/builder", { state: { prompt } });
    } catch (err: any) {
      console.error("[CreateProject] Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#080710] relative overflow-hidden"
    style={{
      backgroundImage: "url('/images/bg7.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
    >
      {/* <div className="relative w-[430px] h-[520px]"> */}
        <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-[#1845ad] to-[#23a2f6] rounded-full top-20 left-88"></div>
        <div className="absolute w-[200px] h-[200px] bg-gradient-to-r from-[#ff512f] to-[#f09819] rounded-full bottom-20 right-81"></div>
      {/* </div> */}
      <form 
        onSubmit={handleCreateProject} 
        className="relative z-10 w-[400px] p-10 bg-white/10 backdrop-blur-md border border-white/10 shadow-lg rounded-lg"
      >
        <h3 className="text-2xl font-semibold text-white text-center">Create a New Project</h3>
        
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <label className="block mt-6 text-white font-medium">Project Name</label>
        <input
          type="text"
          className="w-full mt-2 p-3 bg-white/10 text-white rounded outline-none"
          placeholder="Enter project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="block mt-6 text-white font-medium">Project Description</label>
        <textarea
          className="w-full mt-2 p-3 bg-white/10 text-white rounded outline-none"
          placeholder="Enter project description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="block mt-6 text-white font-medium">Prompt</label>
        <textarea
          className="w-full mt-2 p-3 bg-white/10 text-white rounded outline-none"
          placeholder="Enter prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full mt-6 py-3 bg-white text-[#080710] font-semibold rounded cursor-pointer"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="mt-4 w-full text-white underline text-center"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateProject;