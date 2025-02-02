import React, { useState } from 'react';
import { User, Plus, Briefcase, Home, Info, Phone, LogOut } from 'lucide-react';

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

  const handleSignOut = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-900" 
    style={{ backgroundImage: "url('./images/bg7.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Header with Navigation */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-400 animate-pulse" />
                <h1 className="ml-2 text-2xl font-bold text-white">Dashboard</h1>
              </div>
              <nav className="flex items-center space-x-6">
                <a href="#" className="flex items-center text-slate-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </a>
                <a href="#" className="flex items-center text-slate-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105">
                  <Info className="w-4 h-4 mr-2" />
                  About
                </a>
                <a href="#" className="flex items-center text-slate-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Us
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4 relative">
              <span className="text-slate-300">{user.name}</span>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="focus:outline-none transform transition-transform duration-300 hover:scale-105"
                  aria-label="User menu"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border-2 border-blue-400 cursor-pointer hover:border-blue-300 transition-colors duration-300"
                    />
                  ) : (
                    <User className="h-10 w-10 p-2 rounded-full bg-slate-700 text-blue-400 cursor-pointer hover:bg-slate-600 transition-colors duration-300" />
                  )}
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-xl py-1 z-10 border border-slate-700 animate-fadeIn">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors duration-300"
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
          <h2 className="text-2xl font-semibold text-white">Projects</h2>
          <button className="inline-flex items-center px-4 py-2 border border-blue-400 rounded-md shadow-lg text-sm font-medium text-white bg-blue-400 hover:bg-blue-400 hover:text-white focus:outline-none transform hover:-translate-y-1  focus:ring-blue-500 transition-all duration-300 ">
            <Plus className="h-5 w-5 mr-2" />
            Create New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-slate-700 hover:border-blue-400 transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {project.name}
              </h3>
              <p className="text-slate-300">
                {project.description}
              </p>
              <div className="mt-4 flex justify-end">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-300 group flex items-center">
                  View Details
                  <span className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1">→</span>
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