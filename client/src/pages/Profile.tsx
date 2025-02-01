import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { FaFolderOpen, FaCode, FaDatabase, FaFileAlt, FaProjectDiagram } from "react-icons/fa";

const projectIcons = [FaFolderOpen, FaCode, FaDatabase, FaFileAlt, FaProjectDiagram];

const Profile: React.FC = () => {

  const [username, setUsername] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ _id: string; name: string; description?: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/users/user`, {
          withCredentials: true,
        });

        setUsername(response.data.username);
        console.log("User:", response.data);

        const projectResponse = await axios.get(`${BACKEND_URL}/project/get-all-projects/${response.data.userId}`, {
          withCredentials: true,
        });

        setProjects(projectResponse.data);
      } catch (err) {
        console.error("Error fetching user/projects:", err);
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="text-lg font-semibold">
          Welcome, <span className="text-purple-600">{username || "Guest"}!</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-bold">Projects</h2>

          {projects.map((project, index) => {
            const Icon = projectIcons[index % projectIcons.length];
            return (
              <div key={project._id} className="flex items-center bg-gray-50 hover:bg-gray-200 p-4 rounded-lg cursor-pointer"
                onClick={() => navigate(`/projects/${project._id}`)}>
                <Icon className="text-purple-600 text-3xl mr-4" />
                <div>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-sm">{project.description || "No description available."}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate("/create-project")} className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg">
          + Create New Project
        </button>
      </div>
    </div>
  );
};

export default Profile;
