import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { FileExplorer } from "../components/FileExplorer";
import { CodeEditor } from "../components/CodeEditor";
import { FileItem } from "../types";

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [structuredFiles, setStructuredFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // ✅ Fetch project details
        const projectResponse = await axios.get(`${BACKEND_URL}/project/${projectId}`, {
          withCredentials: true,
        });
        setProjectName(projectResponse.data.name);

        // ✅ Fetch project files
        const filesResponse = await axios.get(`${BACKEND_URL}/project/getAllFiles?projectId=${projectId}`, {
          withCredentials: true,
        });

        console.log("[ProjectPage] Fetched raw files:", filesResponse.data.files);

        // ✅ Process files into correct folder structure
        const structuredFiles = buildFolderStructure(filesResponse.data.files);
        setStructuredFiles(structuredFiles);
      } catch (err) {
        console.error("[ProjectPage] Error fetching project data:", err);
        setError("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const buildFolderStructure = (flatFiles: FileItem[]): FileItem[] => {
    const fileMap: Record<string, FileItem> = {};
  
    // Step 1: Convert flat list to a map
    flatFiles.forEach((file) => {
      fileMap[file.path] = {
        name: file.name,
        type: file.type,
        path: file.path,
        content: file.type === "file" ? file.content : undefined,
        children: file.type === "folder" ? [] : undefined, // Initialize empty children for folders
      };
    });
  
    // Step 2: Attach children correctly to their parent folders
    flatFiles.forEach((file) => {
      const parentPath = file.path.split("/").slice(0, -1).join("/") || "/";
  
      if (parentPath !== "/") {
        if (!fileMap[parentPath]) {
          // Ensure the parent folder exists
          fileMap[parentPath] = {
            name: parentPath.split("/").pop() || "root",
            type: "folder",
            path: parentPath,
            children: [],
          };
        }
  
        fileMap[parentPath]?.children?.push(fileMap[file.path]);
      }
    });
  
    // Step 3: Get only top-level folders/files
    return Object.values(fileMap).filter(
      (file) => !file.path.includes("/") || file.path.split("/").length === 2
    );
  };
  
  

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-100">{projectName || "Project"}</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-1/4 bg-gray-800 p-4 overflow-auto">
          <FileExplorer files={structuredFiles} onFileSelect={setSelectedFile} />
        </div>

        {/* Code Editor */}
        <div className="w-3/4 bg-gray-900 p-4">
          <CodeEditor file={selectedFile} />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
