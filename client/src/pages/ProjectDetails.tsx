import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { FileExplorer } from "../components/FileExplorer";
import { CodeEditor } from "../components/CodeEditor";
import { FileItem } from "../types";
import { User, Briefcase, Home, LogOut } from "lucide-react";

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [structuredFiles, setStructuredFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; avatar?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/users/user`, {
          withCredentials: true,
        });
        setUser({ name: response.data.username });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = () => {
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectResponse = await axios.get(`${BACKEND_URL}/project/${projectId}`, {
          withCredentials: true,
        });
        setProjectName(projectResponse.data.name);

        // Fetch project files
        const filesResponse = await axios.get(`${BACKEND_URL}/project/getAllFiles?projectId=${projectId}`, {
          withCredentials: true,
        });

        console.log("[ProjectPage] Fetched raw files:", filesResponse.data.files);

        // Process files into correct folder structure
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
    <div className="min-h-screen bg-slate-900 flex flex-col"
      // style={{ backgroundImage: "url('/images/bg7.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <header className="bg-slate-800 shadow-lg border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Briefcase className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">{projectName || "Project"}</h1>
          <p className="text-sm text-gray-300">Project workspace</p>
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
      </header>

      <div className="flex flex-1 overflow-hidden h-full w-full"
          // style={{ backgroundImage: "url('/images/bg7.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="w-1/4 overflow-auto p-6 bg-slate-900"
        >
        <FileExplorer files={structuredFiles} onFileSelect={setSelectedFile} />
          
        </div>
        <div className="w-3/4  bg-slate-900 p-6 " >
          <CodeEditor file={selectedFile} />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
