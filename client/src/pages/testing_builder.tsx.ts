import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  prompt?: string;
}

export default function Builder() {
  const location = useLocation();
  const projectData = location.state || {}; // Retrieve project data

  // State to store project details
  const [project, setProject] = useState<Project>({
    id: '',
    name: '',
    description: '',
    prompt: ''
  });

  // State to store files
  const [files, setFiles] = useState([
    {
      name: 'src',
      type: 'folder',
      path: '/src',
      children: [
        {
          name: 'config.js',
          type: 'file',
          path: '/src/config.js',
          content: '' // Will be updated dynamically
        }
      ]
    }
  ]);

  // Set project data when component mounts
  useEffect(() => {
    if (projectData._id) {
      setProject({
        id: projectData._id || '',
        name: projectData.name || '',
        description: projectData.description || '',
        prompt: projectData.prompt || '',
      });

      // Update config.js dynamically with the correct PROJECTID
      setFiles((prevFiles) => {
        return prevFiles.map((folder) => {
          if (folder.name === 'src') {
            return {
              ...folder,
              children: folder.children.map((file) =>
                file.name === 'config.js'
                  ? {
                      ...file,
                      content: `
                        export const PROJECTID = "${projectData._id}"; 
                        export const BACKEND_URL = "https://ad37-14-139-196-209.ngrok-free.app/api/v1";
                      `
                    }
                  : file
              )
            };
          }
          return folder;
        });
      });
    }
  }, [projectData]);

  console.log("Updated config.js content:", files.find(f => f.name === "src")?.children?.find(f => f.name === "config.js")?.content);

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold">Project Builder</h1>
        <p className="text-gray-400 mt-2">Build your project using AI</p>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Project Details:</h2>
          <p className="mt-2"><strong>ID:</strong> {project.id}</p>
          <p className="mt-2"><strong>Name:</strong> {project.name}</p>
          <p className="mt-2"><strong>Description:</strong> {project.description}</p>
          {project.prompt && <p className="mt-2"><strong>Prompt:</strong> {project.prompt}</p>}
        </div>
      </div>
    </div>
  );
}
