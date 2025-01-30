import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { FileNode } from '@webcontainer/api';
import { Loader } from '../components/Loader';
import { processFiles } from '../pages/Wrapper';
import { processFilesWithStyles } from "../utils/processFiles";
import fileInfo from "../utils/editableFileInfo.json";

const PROJECTID = "679a26655a84fc483c15b205";

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string }; // made here changes
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant", content: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);
  // UseState with hardcoded `editableComponents.js`
  // Hardcoded file structure with `editableComponents.js`
const initialFiles: FileItem[] = [
  {
    name: "src",
    type: "folder",
    path: "/src",
    children: [
      {
        name: "editableComponents.js",
        type: "file",
        path: "/src/editableComponents.js",
        content: fileInfo.FileData.content,
      },
    ],
  },
];

const [files, setFiles] = useState<FileItem[]>(initialFiles);

  // const [steps, setSteps] = useState<Step[]>([
  //   {
  //     id: 1,
  //     title: 'Initialize Project',
  //     description: 'Set up the project folder structure',
  //     type: 'CreateFolder',
  //     status: 'completed',
  //   },
  // ]);

  // const [files, setFiles] = useState<FileItem[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);

  // useEffect(() => {
  //   const fetchAndProcessFiles = async () => {
  //     setIsProcessing(true);
  //     try {
  //       const projectId = "679a25f45a84fc483c15b1f5";
  //       const response = await axios.get(`${BACKEND_URL}/project/getAllFiles`, {
  //         params: { projectId },
  //       });

  //       console.log('Fetched files:', response.data.files);
  //       setFiles(response.data.files);


  //       const processedFiles = await processFiles(response.data.files, PROJECTID);

  //       console.log('Processed Files:', processedFiles);

  //       setFiles(processedFiles);
  //     } catch (error) {
  //       console.error('Error fetching or processing files:', error);
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   };

  //   fetchAndProcessFiles();
  // }, []);

  // const lastProcessedFilesRef = useRef<FileItem[] | null>(null);
  // const prevFilesRef = useRef<FileItem[]>([]);

  // useEffect(() => {
  //   const fetchFiles = async () => {
  //     setIsProcessing(true);
  //     try {
  //       const projectId = "679a25f45a84fc483c15b1f5";
  //       const response = await axios.get(`${BACKEND_URL}/project/getAllFiles`, {
  //         params: { projectId },
  //       });
  //       console.log('Fetched files:', response.data.files);

  //       setFiles(response.data.files);
  //     } catch (error) {
  //       console.error('Error fetching files:', error);
  //     } finally {
  //       setIsProcessing(false); // Release lock
  //     }
  //   };

  //   fetchFiles();
  // }, []);

  // // Making all files editable ------------------>>>>>>>>
  // useEffect(() => {
  //   if (!files.length || isProcessing) return; // Prevent unnecessary processing or running in parallel

  //   const processAndSetFiles = async () => {

  //     try {
  //       const processedFiles = await processFiles(files, PROJECTID);

  //       if (
  //         JSON.stringify(processedFiles) !== JSON.stringify(lastProcessedFilesRef.current)
  //       ) {
  //         console.log('Processing files:', files);
  //         console.log('Processed Files:', processedFiles);

  //         lastProcessedFilesRef.current = processedFiles;
  //         setFiles(processedFiles);
  //       }
  //     } catch (error) {
  //       console.error('Error processing files:', error);
  //     }
  //   };

  //   processAndSetFiles();
  // }, []);


  // -----------------NEW APPROACH----------------
  // Sync files useEffect (Runs only when `isProcessing` is false)

  // useEffect(() => {
  //   if (!files.length || isProcessing) return; // Don't proceed if files are empty or still being processed

  //   const syncFiles = async () => {
  //     setIsProcessing(true);
  //     try {
  //       for (const file of files) {
  //         try {
  //           const response = await axios.get(`${BACKEND_URL}/project/checkFileExists`, {
  //             params: { projectId: PROJECTID, path: file.path },
  //           });

  //           const fileExists = response.data.exists;

  //           if (fileExists) {
  //             console.log(`File already exists, updating: ${file.path}`);

  //             await axios.delete(`${BACKEND_URL}/project/deleteFile`, {
  //               data: { projectId: PROJECTID, path: file.path },
  //             });

  //             console.log(`Deleted file: ${file.path}`);
  //           } else {
  //             console.log(`New file detected, uploading: ${file.path}`);
  //           }

  //           await axios.post(`${BACKEND_URL}/project/uploadFile`,
  //             {
  //               projectId: PROJECTID,
  //               name: file.name,
  //               path: file.path,
  //               content: file.content,
  //               type: file.type,
  //             },
  //             {
  //               headers: {
  //                 'Content-Type': 'application/json',
  //               },
  //             }
  //           );

  //           console.log(`Uploaded file: ${file.path}`);
  //         } catch (error) {
  //           console.error(`Error processing file: ${file.path}`, error.response?.data || error.message);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error syncing files:', error);
  //     }
  //     setIsProcessing(false);
  //   };

  //   // Ensure it only runs when processing is done
  //   if (JSON.stringify(prevFilesRef.current) !== JSON.stringify(files)) {
  //     syncFiles();
  //   }

  //   prevFilesRef.current = files;
  // }, [files, isProcessing]);


  // -------OLD APPROACH----------------
  // // Ref to store the previous state of files
  // const prevFilesRef = useRef<FileItem[]>(files);
  // console.log("prevFilesRef", prevFilesRef);

  // useEffect(() => {
  //   const prevFiles = prevFilesRef.current;

  //   // Identify added and updated files
  //   const addedFiles = files.filter(
  //     (currentFile) => !prevFiles.some((prevFile) => prevFile.path === currentFile.path)
  //   );

  //   // Call the backend for added files
  //   addedFiles.forEach(async (file) => {
  //     console.log("file", file);
  //     try {
  //       await axios.post(`${BACKEND_URL}/project/uploadFile`, 
  //         {
  //           projectId: '6799ff6e0c1d7a9c8b557039',
  //           name: file.name,
  //           path: file.path,
  //           content: file.content,
  //           type: file.type,
  //         },
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );

  //       console.log(`Added file: ${file.path}`);
  //     } catch (error) {
  //       console.error(`Error adding file: ${file.path}`, error);
  //     }
  //   });

  // }, [files]);


  //Folder Structure handled 
  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;

    steps.filter(({ status }) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        const finalAnswerRef = currentFileStructure;

        let currentFolder = "";

        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          const currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            // final file
            const file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            const folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }

            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }

    })

    if (updateHappened) {

      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }

      }))
    }
    console.log("files are: ", files);
    console.log("steps are: ", steps);

  }, [steps, files]);


  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ?
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              )
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  /////init function
  /////init function
  /////init function

  async function init() {
    console.log(prompt);
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
    console.log("response is: ", response.data);

    const { prompts, uiPrompts } = response.data;

    //parsing all UI prompt in proper fromat 
    //setting up steps 
    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    console.log("hello all steps are here: ", steps);

    setLoading(true);

    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);
    console.log("new stpes", steps);

    setSteps((prevSteps) => {
      const lastStepId = prevSteps.length > 0 ? Math.max(...prevSteps.map(step => step.id)) : 0;
      const newSteps = parseXml(stepsResponse.data.response, lastStepId + 1); // Start from last used id + 1
      return [...prevSteps, ...newSteps.map(x => ({
        ...x,
        status: "pending" as "pending"
      }))];
    });

    console.log("new steps", steps);


    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, { role: "assistant", content: stepsResponse.data.response }])
  }

  useEffect(() => {
    init();
  }, [])

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
        await axios.post(`${BACKEND_URL}/project/uploadFile`, {
          projectId,
          name: file.name,
          path: file.path,
          content: file.content,
          type: file.type,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });

        console.log(`Uploaded file: ${file.path}`);
      }
    } catch (error) {
      console.error(`Error uploading files for project ${projectId}:`, error.response?.data || error.message);
    }
  };


  const handleClick = async () => {
    console.log("Fetching style changes...");

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/project/get-style?projectId=679a26655a84fc483c15b205`,
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
      await deleteAllFiles(PROJECTID);
      await uploadFiles(updatedFiles, PROJECTID);

      //////////////////////////////////////////

      // Update the state with modified files
      setFiles(updatedFiles);

      console.log("Files updated successfully:", updatedFiles);

    } catch (error) {
      console.error("Error fetching style changes:", error);
      throw error; // Propagate error to caller
    }

    setIsProcessing(false);

  };

  const handlePreview = async () => {
    setIsProcessing(true);

    try {
      console.log('Files to process are :', files);

      // Process the files
      const processedFiles = await processFiles(files, PROJECTID);

      const file = fileInfo.FileData;
      console.log('file', file);

      setFiles((prevFiles) => {
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
      });
      
      
      

      console.log('Processed Files:', processedFiles);

      setFiles(processedFiles);

    } catch (error) {
      console.error('Error fetching or processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={handleClick}
          disabled={isProcessing} // Disable button while processing
        >
          {isProcessing ? "Saving..." : "Save Changes"}
        </button>

        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={handlePreview}
          disabled={isProcessing} // Disable button while processing
        >
          "Click here to Preview"
        </button>

        {isProcessing && (
          <div className="mt-2 text-gray-700 font-medium">
            Changes are being made, please wait...
          </div>
        )}

      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
              <div>
                <div className='flex'>
                  <br />
                  {(loading || !templateSet) && <Loader />}
                  {!(loading || !templateSet) && <div className='flex'>
                    <textarea value={userPrompt} onChange={(e) => {
                      setPrompt(e.target.value)
                    }} className='p-2 w-full'></textarea>
                    <button onClick={async () => {
                      const newMessage = {
                        role: "user" as "user",
                        content: userPrompt
                      };

                      setLoading(true);
                      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                        messages: [...llmMessages, newMessage]
                      });
                      setLoading(false);

                      setLlmMessages(x => [...x, newMessage]);
                      setLlmMessages(x => [...x, {
                        role: "assistant",
                        content: stepsResponse.data.response
                      }]);

                      setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                        ...x,
                        status: "pending" as "pending"
                      }))]);

                    }} className='bg-purple-400 px-4'>Send</button>
                  </div>}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <FileExplorer
              files={files}
              onFileSelect={setSelectedFile}
            />
          </div>
          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {activeTab === 'code' ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewFrame webContainer={webcontainer} files={files} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}