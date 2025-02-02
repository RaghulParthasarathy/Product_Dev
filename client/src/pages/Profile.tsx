// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { BACKEND_URL } from "../config";
// import { FaFolderOpen, FaCode, FaDatabase, FaFileAlt, FaProjectDiagram } from "react-icons/fa";

// const projectIcons = [FaFolderOpen, FaCode, FaDatabase, FaFileAlt, FaProjectDiagram];

// const Profile: React.FC = () => {

//   const [username, setUsername] = useState<string | null>(null);
//   const [projects, setProjects] = useState<{ _id: string; name: string; description?: string }[]>([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await axios.get(`${BACKEND_URL}/users/user`, {
//           withCredentials: true,
//         });

//         setUsername(response.data.username);
//         console.log("User:", response.data);

//         const projectResponse = await axios.get(`${BACKEND_URL}/project/get-all-projects/${response.data.userId}`, {
//           withCredentials: true,
//         });

//         setProjects(projectResponse.data);
//       } catch (err) {
//         console.error("Error fetching user/projects:", err);
//       }
//     };

//     fetchUser();
//   }, [navigate]);

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Profile</h1>
//         <div className="text-lg font-semibold">
//           Welcome, <span className="text-purple-600">{username || "Guest"}!</span>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 shadow-md rounded-lg">
//           <h2 className="text-2xl font-bold">Projects</h2>

//           {projects.map((project, index) => {
//             const Icon = projectIcons[index % projectIcons.length];
//             return (
//               <div key={project._id} className="flex items-center bg-gray-50 hover:bg-gray-200 p-4 rounded-lg cursor-pointer"
//                 onClick={() => navigate(`/projects/${project._id}`)}>
//                 <Icon className="text-purple-600 text-3xl mr-4" />
//                 <div>
//                   <h3 className="text-lg font-semibold">{project.name}</h3>
//                   <p className="text-sm">{project.description || "No description available."}</p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <button onClick={() => navigate("/create-project")} className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg">
//           + Create New Project
//         </button>
//       </div>
//     </div>
//   );
// };
import { useState, useEffect } from 'react';
import { User, Plus, Briefcase, Home, Info, Phone, LogOut, Sun, Moon } from 'lucide-react';

// Mock data for demonstration
const user = {
  name: "John Doe",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80"
};

const projects = [
  { id: 1, name: "E-commerce Platform", description: "A full-featured online shopping platform with cart and checkout." },
  { id: 2, name: "Portfolio Website", description: "Personal portfolio showcasing projects and skills." },
  { id: 3, name: "Task Manager", description: "Collaborative task management application with real-time updates." }
];

function Profile() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleSignOut = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header with Navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              </div>
              <nav className="flex items-center space-x-6">
                <a href="#" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </a>
                <a href="#" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out">
                  <Info className="w-4 h-4 mr-2" />
                  About
                </a>
                <a href="#" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Us
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4 relative">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="focus:outline-none"
                  aria-label="User menu"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-150"
                    />
                  ) : (
                    <User className="h-10 w-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150" />
                  )}
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-100 dark:border-gray-700">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Projects</h2>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors duration-200">
            <Plus className="h-5 w-5 mr-2" />
            Create New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {project.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {project.description}
              </p>
              <div className="mt-4 flex justify-end">
                <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition-colors duration-150">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Profile;