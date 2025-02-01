import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

const CreateProject: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [prompt, setPrompt] = useState<string>(""); // ✅ Prompt field
  const [loading, setLoading] = useState<boolean>(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Create a New Project</h1>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form onSubmit={handleCreateProject} className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Project Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded mt-1 focus:ring focus:ring-purple-300"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Project Description</label>
            <textarea
              className="w-full p-2 border rounded mt-1 focus:ring focus:ring-purple-300"
              placeholder="Enter project description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* ✅ New Prompt Field (Passed to Builder, Not Backend) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Prompt</label>
            <textarea
              className="w-full p-2 border rounded mt-1 focus:ring focus:ring-purple-300"
              placeholder="Enter prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg shadow-lg hover:bg-purple-700 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>

        <button
          onClick={() => navigate("/profile")}
          className="mt-4 w-full text-gray-600 underline text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateProject;
