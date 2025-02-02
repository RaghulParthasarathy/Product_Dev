import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
  content?: string;
  path: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  prompt?: string;
}

const DownloadPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project>({
    id: '679f5382770ad5c11822ec7e',
    name: 'My Project',
    description: 'Project Description',
  });

  // Helper function to recursively add files to zip
  const addFileToZip = (zip: JSZip, file: FileItem) => {
    console.log('function called for:', file.name);
    
    if (file.type === 'file') {
      console.log('Processing file:', file.path);
      const filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      zip.file(filePath, file.content || '');
      console.log('Added file:', filePath);
    }
    else if (file.type === 'folder' && file.children) {
      console.log('Processing folder:', file.path);
      file.children.forEach(childFile => {
        addFileToZip(zip, childFile);
      });
    }
  };

  const handleDownloadCode = async () => {
    try {
      setLoading(true);
      
      // Fetch files first
      const sampleFiles: FileItem[] = [
        {
          name: 'package.json',
          type: 'file',
          path: '/package.json',
          content: JSON.stringify({
            name: "project",
            version: "1.0.0",
            dependencies: {}
          }, null, 2)
        },
        {
          name: 'src',
          type: 'folder',
          path: '/src',
          children: [
            {
              name: 'index.js',
              type: 'file',
              path: '/src/index.js',
              content: 'console.log("Hello World!");'
            }
          ]
        }
      ];

      console.log('Files prepared:', sampleFiles);

      // Create zip immediately after fetching files
      const zip = new JSZip();
      
      // Process all files
      sampleFiles.forEach(file => {
        console.log('Processing:', file.name);
        addFileToZip(zip, file);
      });

      // Generate and save the zip file
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      });

      // Save with project name or default
      const zipName = `${project.name || 'project'}-${Date.now()}.zip`;
      saveAs(blob, zipName);
    } catch (error) {
      console.error('Error in download process:', error);
      alert('Error downloading code. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Project Builder</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Project Details:</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {project.id}</p>
              <p><span className="font-medium">Name:</span> {project.name}</p>
              <p><span className="font-medium">Description:</span> {project.description}</p>
            </div>
          </div>

          <button
            onClick={handleDownloadCode}
            disabled={loading}
            className={`
              w-full md:w-auto px-6 py-3 rounded-lg font-medium
              ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors duration-200
            `}
          >
            {loading ? 'Processing...' : 'Download Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;