import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { TabView } from '../components/TabView';
import { PreviewFrame } from '../components/PreviewFrame';
import { FileExplorer } from "../components/FileExplorer";
import { CodeEditor } from "../components/CodeEditor";
import { FileItem } from "../types";
import { processFilesWithStyles } from "../utils/processFiles";
import fileInfo from "../utils/editableFileInfo.json";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useWebContainer } from '../hooks/useWebContainer';


import { processFiles, processFileContent } from '../pages/Wrapper';

import { User, Briefcase, Home, LogOut, Save, Eye, Download } from "lucide-react";

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

  const webcontainer = useWebContainer();

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

  // const buildFolderStructure = (flatFiles: FileItem[]): FileItem[] => {
  //   const fileMap: Record<string, FileItem> = {};

  //   // Step 1: Convert flat list to a map
  //   flatFiles.forEach((file) => {
  //     fileMap[file.path] = {
  //       name: file.name,
  //       type: file.type,
  //       path: file.path,
  //       content: file.type === "file" ? file.content : undefined,
  //       children: file.type === "folder" ? [] : undefined, // Initialize empty children for folders
  //     };
  //   });

  //   // Step 2: Attach children correctly to their parent folders
  //   flatFiles.forEach((file) => {
  //     const parentPath = file.path.split("/").slice(0, -1).join("/") || "/";

  //     if (parentPath !== "/") {
  //       if (!fileMap[parentPath]) {
  //         // Ensure the parent folder exists
  //         fileMap[parentPath] = {
  //           name: parentPath.split("/").pop() || "root",
  //           type: "folder",
  //           path: parentPath,
  //           children: [],
  //         };
  //       }

  //       fileMap[parentPath]?.children?.push(fileMap[file.path]);
  //     }
  //   });

  const buildFolderStructure = (flatFiles: FileItem[]): FileItem[] => {
    const fileMap: Record<string, FileItem> = {};
  
    // Step 1: Convert flat list to a map
    flatFiles.forEach((file) => {
      fileMap[file.path] = {
        name: file.name,
        type: file.type,
        path: file.path,
        content: file.type === "file" ? file.content : undefined,
        children: file.type === "folder" ? [] : undefined,
      };
    });
  
    // Step 2: Attach children correctly to their parent folders
    flatFiles.forEach((file) => {
      const parentPath = file.path.split("/").slice(0, -1).join("/") || "/";
  
      if (parentPath !== "/") {
        if (!fileMap[parentPath]) {
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
  
    // Step 3: Return fixed top-level order (exactly 5 expected entries)
    const fixedOrder = [
      "/src",
      "/package.json",
      "/tailwind.config.js",
      "/postcss.config.js",
      "/public",
    ];
  
    return fixedOrder
      .map((path) => fileMap[path])
      .filter(Boolean); // In case any are missing
  };
  

  //   // Step 3: Get only top-level folders/files
  //   return Object.values(fileMap).filter(
  //     (file) => !file.path.includes("/") || file.path.split("/").length === 2
  //   );

  // };



  //////////UPDATED CODE////////////
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');


  const [isProcessing, setIsProcessing] = useState(false);
  const [Message, setMessage] = useState('');


  // Delete all existing files in the backend
  const deleteAllFiles = async (projectId: string): Promise<void> => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/project/deleteAllFiles?projectId=${projectId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(response.data);

      console.log(`All files deleted successfully for project: ${projectId}`);
    } catch (error) {
      console.error(`Error deleting files for project ${projectId}:`, error.response?.data || error.message);
      throw error;
    }
  };

  // Upload all processed files
  const uploadFiles = async (files: FileItem[], projectId: string) => {
    try {
      for (const file of files) {
        if (file.type === "folder" && file.children) {
          // If it's a folder, recursively upload its children
          console.log(`Entering folder: ${file.path}`);
          await uploadFiles(file.children, projectId);
        } else {
          // Upload file
          await axios.post(
            `${BACKEND_URL}/project/uploadFile`,
            {
              projectId,
              name: file.name,
              path: file.path,
              content: file.content,
              type: file.type,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          console.log(`Uploaded file: ${file.path}`);
        }
      }
    } catch (error) {
      console.error(
        `Error uploading files for project ${projectId}:`,
        error.response?.data || error.message
      );
    }
  };


  const handleClick = async () => {
    setIsProcessing(true); // Set to true to indicate the process has started
    setMessage("Changes are being saved..");

    console.log("Fetching style changes...");

    try {
      const response = await fetch(
        `https://product-dev-kriti-25.onrender.com/api/v1/project/get-style?projectId=${projectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text(); // Get error response as text
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Style changes fetched:", data.styleChanges);

      // Process files using React Recast
      const updatedFiles = processFilesWithStyles(files, data.styleChanges);

      //////////////////////////////////////////

      // Save the updated files to DB
      console.log("Saving style changes to DB...");
      await deleteAllFiles(projectId);
      await uploadFiles(updatedFiles, projectId); //////////////////

      //////////////////////////////////////////

      // Update the state with modified files
      setStructuredFiles(updatedFiles);

      console.log("Files updated successfully:", updatedFiles);

      setMessage("Style changes saved successfully!");

      setTimeout(() => {
        setMessage("");
      }, 2000);

      // Success Popup
      setTimeout(() => alert("Style changes saved successfully!"), 500);

    } catch (error) {

      setMessage("Error fetching style changes!!");
      setTimeout(() => {
        setMessage("");
      }, 2000);

      console.error("Error fetching style changes:", error);
      throw error; // Propagate error to caller
    }

    setIsProcessing(false);

  };



  const handlePreview = async () => {
    setIsProcessing(true);

    setMessage("Loading preview. Please wait...");

    try {
      console.log('Files to process are :', structuredFiles);

      // Process the files
      const processedFiles = await processFiles(structuredFiles, projectId);

      const file = fileInfo.FileData;
      console.log('file', file);

      setStructuredFiles((prevFiles) => {
        // Clone the files array to avoid mutating state directly
        let updatedFiles = [...prevFiles];

        // Find the `src` folder
        let srcFolder = updatedFiles.find((folder) => folder.name === "src" && folder.type === "folder");

        if (srcFolder) {
          // Ensure children exists and is a new reference (for React state updates)
          srcFolder.children = [...(srcFolder.children || []), {
            name: file.name,
            type: file.type,
            children: [], // Ensure children is an array
            content: file.content || "", // Ensure content is a string
            path: file.path,
          }];
        }

        return updatedFiles;
      }
      );

      console.log('Processed Files:', processedFiles);

      setStructuredFiles(processedFiles);

      setMessage("Now you can see the preview!");

      setTimeout(() => {
        setMessage("");
      }, 2000);

    } catch (error) {

      setMessage("Error fetching or processing files!!");
      setTimeout(() => {
        setMessage("");
      }, 2000);

      console.error('Error fetching or processing files:', error);
    } finally {

      setMessage("Now you can see the preview!");

      setTimeout(() => {
        setMessage("");
      }, 2000);


      setIsProcessing(false);
    }
  };

  const buildFolderStructure1 = (flatFiles: FileItem[]): FileItem[] => {
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

  const fetchProjectFiles = async () => {
    try {
      setLoading(true);
      // Fetch project files
      const filesResponse = await axios.get(`${BACKEND_URL}/project/getAllFiles?projectId=${PROJECTID}`, {
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
      console.log('Fetching project files...');

      setMessage("Preparing your download. Please wait...");

      // Fetch project files before downloading
      await fetchProjectFiles();
      console.log('Files prepared:', structuredFiles);

      // Create zip immediately after fetching files
      const zip = new JSZip();

      // Process all files
      structuredFiles.forEach(file => {
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
      const zipName = `${projectId}-${Date.now()}.zip`; // Project name can be customized as needed
      saveAs(blob, zipName);

      setMessage("Downloaded succefully.");
      setTimeout(() => {
        setMessage("");
      }, 2000);

    } catch (error) {
      console.error('Error in download process:', error);
      setMessage("Error in download process, please retry.");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      alert('Error downloading code. Check console for details.');
    } finally {
      setLoading(false);
    }
  };



  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>;

  // if (error) return <p className="text-center text-red-500">{error}</p>;

  // return (
  //   <div className="min-h-screen bg-slate-900 flex flex-col"
  //     // style={{ backgroundImage: "url('/images/bg7.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
  //   >
  //     <header className="bg-slate-800 shadow-lg border-b border-slate-700 px-6 py-4 flex justify-between items-center">
  //       <div className="flex items-center space-x-4">
  //         <Briefcase className="h-6 w-6 text-blue-400" />
  //         <h1 className="text-xl font-bold text-white">{projectName || "Project"}</h1>
  //         <p className="text-sm text-gray-300">Project workspace</p>
  //         <nav className="flex items-center space-x-6">
  //             <a href="/profile" className="flex items-center text-slate-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"> <Home className="w-4 h-4 mr-2" /> Dashboard </a>
  //           </nav>
  //       </div>
  //       <div className="flex items-center space-x-4 relative">
  //         <span className="text-slate-300">{user?.name || "Guest"}</span>
  //         <div className="relative">
  //           <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none hover:scale-105 transition-transform duration-300">
  //             {user?.avatar ? (
  //               <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full border-2 border-blue-400 cursor-pointer hover:border-blue-300 transition-colors duration-300" />
  //             ) : (
  //               <User className="h-10 w-10 p-2 rounded-full bg-slate-700 text-blue-400 cursor-pointer hover:bg-slate-600 transition-colors duration-300" />
  //             )}
  //           </button>
  //           {dropdownOpen && (
  //             <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-xl py-1 z-10 border border-slate-700 animate-fadeIn">
  //               <button onClick={handleSignOut} className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors duration-300">
  //                 <LogOut className="h-4 w-4 mr-2" /> Sign out
  //               </button>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </header>

      

  //     <div className="flex flex-1 overflow-hidden h-full w-full"
  //         // style={{ backgroundImage: "url('/images/bg7.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
  //     >
  //       <div className="w-1/4 overflow-auto p-6 bg-slate-900"
  //       >
  //       <FileExplorer files={structuredFiles} onFileSelect={setSelectedFile} />
          
  //       </div>
  //       <div className="w-3/4  bg-slate-900 p-6 " >
  //         <CodeEditor file={selectedFile} />
  //       </div>
  //     </div>
  //   </div>
  // );






  return (
    <div className="min-h-screen bg-gray-900 flex flex-col spac">

      <header className="bg-slate-800 shadow-lg border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col space-y-4">
          {/* Top Row: Title, Nav, User */}
          <div className="flex justify-between items-start flex-wrap gap-y-4">
            {/* Left Side */}
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-8">
                <div className="flex items-center">
                  <Briefcase className="h-8 w-8 text-blue-400 animate-pulse" />
                  <h1 className="ml-2 text-2xl font-bold text-white">Preview Project</h1>
                </div>
                <nav className="flex items-center space-x-6">
                  <a href="/profile" className="flex items-center text-slate-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                    <Home className="w-4 h-4 mr-2" /> Dashboard
                  </a>
                </nav>
              </div>

              <div>
                <p className="text-sm text-gray-400 mt-1">Name: {projectName}</p>
              </div>
            </div>

            {/* Right Side: User Profile */}
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

          {/* Button Row */}
          <div className="flex justify-left items-center space-x-6 mt-2">
            {/* Save Button */}
            <div className="relative group">
              <button
                onClick={handleClick}
                disabled={isProcessing}
                className={`text-blue-400 hover:text-blue-300 p-2 rounded-full transition duration-300 ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Save className="h-5 w-5" />
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Save changes
              </div>
            </div>

            {/* Preview Button */}
            <div className="relative group">
              <button
                onClick={handlePreview}
                disabled={isProcessing}
                className={`text-blue-400 hover:text-blue-300 p-2 rounded-full transition duration-300 ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Eye className="h-5 w-5" />
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Preview Website
              </div>
            </div>

            {/* Download Button */}
            <div className="relative group">
              <button
                onClick={handleDownloadCode}
                disabled={loading}
                className={`text-blue-400 hover:text-blue-300 p-2 rounded-full transition duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Download className="h-5 w-5" />
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Download Code
              </div>
            </div>

            {isProcessing && (
              <div className="text-gray-300 font-medium">
                {Message}
              </div>
            )}

          </div>

        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-4 gap-6 px-4 py-2">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>

              <div className="col-span-1 pl-4">
                <FileExplorer
                  files={structuredFiles}
                  onFileSelect={setSelectedFile}
                />
              </div>

              <div>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(94vh-8rem)] w-[calc(70vw)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)] ">
              {activeTab === 'code' ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewFrame webContainer={webcontainer} files={structuredFiles} />
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );

};

export default ProjectPage;
