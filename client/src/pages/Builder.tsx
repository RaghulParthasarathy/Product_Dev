import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
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
import { processFiles, processFileContent } from '../pages/Wrapper';
import { processFilesWithStyles } from "../utils/processFiles";
import fileInfo from "../utils/editableFileInfo.json";
import sample from "../utils/test_file.json"
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { User, Briefcase, Home, LogOut, Save, Eye, Download } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  prompt?: string;
}

export function Builder() {
  const location = useLocation();

  const projectData = location.state as { _id?: string; name?: string; description?: string; prompt?: string } || {};
  console.log("project data is: ", projectData);

  const [project, setProject] = useState<Project>({
    id: '',
    name: '',
    description: '',
    prompt: ''
  });

  const [showPreview, setShowPreview] = useState(false);


  const [isProcessing, setIsProcessing] = useState(false);
  const [Message, setMessage] = useState('');

  const [userPrompt, setPrompt] = useState(project.prompt);
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant", content: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: 'src',
      type: 'folder',
      path: '/src',
      children: [
        {
          name: 'config.js',
          type: 'file',
          path: '/src/config.js',
          content: ""
        },
        {
          name: 'editableComponents.js',
          type: 'file',
          path: '/src/editableComponents.js',
          content: `
  import React, { createContext, useContext, useState, useEffect } from 'react';
  import { Settings, X } from 'lucide-react';
  import { PROJECTID, BACKEND_URL }from './config';
  import axios from 'axios';

  // Create context for edit mode
  const EditModeContext = createContext();

  // Style editor component
  const StyleEditor = ({ styles, onStyleChange, onClose, elementType }) => {
    console.log(\`Rendering StyleEditor for \${elementType}\`, styles);
    return (
      <div className="fixed top-40 right-0 bg-white p-4 shadow-lg rounded-lg border w-72 z-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Edit {elementType}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Background Color', type: 'color', property: 'backgroundColor', default: '#ffffff' },
            { label: 'Text Color', type: 'color', property: 'color', default: '#000000' },
            { label: 'Font Size (px)', type: 'number', property: 'fontSize', default: '16px' },
            { label: 'Padding (px)', type: 'number', property: 'padding', default: '0px' },
            { label: 'Margin (px)', type: 'number', property: 'margin', default: '0px' },
            { label: 'Border Radius (px)', type: 'number', property: 'borderRadius', default: '0px' },
          ].map(({ label, type, property, default: defaultValue }) => (
            <div key={property}>
              <label className="block text-sm mb-1">{label}</label>
              <input
                type={type}
                value={type === 'color' ? styles[property] || defaultValue : parseInt(styles[property] || defaultValue)}
                onChange={(e) => {
                  console.log(\`Style change: \${property} = \${e.target.value}\`);
                  onStyleChange(property, type === 'color' ? e.target.value : \`\${e.target.value}px\`);
                }}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Higher-Order Component for making elements editable
  const makeEditable = (WrappedComponent) => {
    return function EditableComponent(props) {
      const { editMode, registerElement, updateElement } = useContext(EditModeContext);
      const [showEditor, setShowEditor] = useState(false);
      const elementId = props.id;
      const [styles, setStyles] = useState(props.style || {});
      const [content, setContent] = useState(props.children || '');

      useEffect(() => {
        if (editMode) {
          console.log(\`Registering element \${elementId}\`, { styles, content });
          registerElement(elementId, { styles, content });
        }
      }, [editMode]);

      const handleStyleChange = (property, value) => {
        console.log(\`Updating styles for element \${elementId}: \${property} = \${value}\`);
        const newStyles = { ...styles, [property]: value };
        setStyles(newStyles);
        updateElement(elementId, { styles: newStyles, content });
      };

      const handleContentChange = (e) => {
        const newContent = e.target.innerText;
        console.log(\`Updating content for element \${elementId}: \${newContent}\`);
        setContent(newContent);
        updateElement(elementId, { styles, content: newContent });
      };

      if (!editMode) {
        return <WrappedComponent {...props} style={styles}>{content || props.children}</WrappedComponent>;
      }

      return (
        <div className="relative group">
          <WrappedComponent
            {...props}
            style={styles}
            contentEditable={typeof props.children === 'string'}
            onInput={handleContentChange} // Use onInput for live updates
            suppressContentEditableWarning={true}
          >
            {content || props.children}
          </WrappedComponent>

          <button
            className="absolute flex items-center justify-center top-0 right-0 bg-blue-500 text-white p-1 rounded-bl z-50 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering other handlers
              console.log(\`Opening style editor for element \${elementId}\`);
              setShowEditor(true);
            }}
            aria-label="Edit Styles"
          >
            <Settings size={16} />
          </button>

          {showEditor && (
            <StyleEditor
              styles={styles}
              onStyleChange={handleStyleChange}
              onClose={() => {
                console.log(\`Closing style editor for element \${elementId}\`);
                setShowEditor(false);
              }}
              elementType={WrappedComponent.displayName || 'Element'}
            />
          )}
        </div>
      );
    };
  };

  // Edit mode provider
  export const EditModeProvider = ({ children }) => {
    const [editMode, setEditMode] = useState(false);
    const [elements, setElements] = useState({});

    const registerElement = (id, data) => {
      console.log(\`Registering new element: \${id}\`, data);
      setElements((prev) => ({ ...prev, [id]: data }));
    };

    const updateElement = (id, data) => {
      console.log(\`Updating element \${id}\`, data);
      setElements((prev) => ({ ...prev, [id]: data }));
    };

    //////////////////////////////////////////
    //Functions to convert the "elements" object to a JSON string
    //////////////////////////////////////////

    const extractText = (content) => {
      if (typeof content === "string") {
        return content; // Return plain text as is
      }

      if (Array.isArray(content)) {
        return content.map(extractText).join(" "); // Extract text recursively from arrays
      }

      if (typeof content === "object" && content !== null) {
        if (content.props?.children) {
          return extractText(content.props.children); // Extract text from React children
        }
      }

      return ""; // Default to empty string if no valid text found
    };

    const removeCircularReferences = (obj, seen = new WeakSet()) => {
      if (obj === null || typeof obj !== "object") {
        return obj; // Return primitives as is
      }

      if (seen.has(obj)) {
        return undefined; // Circular reference detected, remove it
      }

      seen.add(obj);

      if (Array.isArray(obj)) {
        return obj.map((item) => removeCircularReferences(item, seen));
      }

      const newObj = {};
      for (const key in obj) {
        if (["return", "_owner", "stateNode"].includes(key)) {
          continue; // Skip React circular references
        }
        newObj[key] = removeCircularReferences(obj[key], seen);
      }

      return newObj;
    };

    const transformElements = (elements) => {
      if (typeof elements !== "object" || elements === null) {
        console.error("Expected elements to be an object, received:", elements);
        return {};
      }

      return Object.entries(elements).reduce((acc, [key, element]) => {
        acc[key] = {
          id: key, // ✅ Add unique ID field
          styles: removeCircularReferences(element.styles || {}), // Clean styles
        };

        // ✅ Include content only if it exists
        const extractedContent = extractText(removeCircularReferences(element.content));
        if (extractedContent) {
          acc[key].content = extractedContent;
        }

        return acc;
      }, {});
    };

    //////////////////////////////////////////
    //////////////////////////////////////////

    const saveStyleChangesToDB = async (transformedJson) => {
      const projectId = PROJECTID; // Replace with dynamic ID if needed
      const apiUrl = \`\${BACKEND_URL}/project/save-style?projectId=\${projectId}\`;

      console.log("Sending styleChanges to DB:", transformedJson);

       try {
        const response = await axios.put(apiUrl, { styleChanges: transformedJson }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Database response:", response.data);
      } catch (error) {
        console.error("Error saving style changes:", error.response ? error.response.data : error.message);
      }

    };


    const handleSave = async () => {
      console.log("Saving changes...");

      // Convert elements to cleaned JSON format
      let transformedJson = transformElements(elements);
      transformedJson = JSON.stringify(transformedJson, null, 2);

      console.log("Transformed JSON:", transformedJson);

      try {
        await saveStyleChangesToDB(transformedJson);
        console.log("Style changes successfully saved to the database.");
      } catch (error) {
        console.error("Error saving style changes:", error);
      }

    };
    const [isProcessing, setIsProcessing] = useState(false);

    return (
      <EditModeContext.Provider value={{ editMode, registerElement, updateElement }}>
        <div className="min-h-screen">
          <div className="fixed top-0 left-0 right-0 bg-white border-b px-4 py-2 flex justify-between items-center z-40">
            <div className="flex items-center gap-4">
              <h1 className="font-bold">Page Editor</h1>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editMode}
                  onChange={(e) => {
                    console.log(\`Edit mode toggled: \${e.target.checked}\`);
                    setEditMode(e.target.checked);
                  }}
                  className="w-4 h-4"
                />
                Edit Mode
              </label>
            </div>
            {/* Save Button */}
            {editMode && (
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2  rounded shadow hover:bg-blue-600"
              >
                Save
              </button>
            )}

          </div>

          <div className={editMode ? 'pt-16' : ''}>{children}</div>
        </div>
      </EditModeContext.Provider>
    );
  };

// Export all possible editable components
export const Editable = {
  div: makeEditable('div'),
  span: makeEditable('span'),
  p: makeEditable('p'),
  h1: makeEditable('h1'),
  h2: makeEditable('h2'),
  h3: makeEditable('h3'),
  h4: makeEditable('h4'),
  h5: makeEditable('h5'),
  h6: makeEditable('h6'),
  section: makeEditable('section'),
  article: makeEditable('article'),
  aside: makeEditable('aside'),
  header: makeEditable('header'),
  footer: makeEditable('footer'),
  main: makeEditable('main'),
  nav: makeEditable('nav'),
  ul: makeEditable('ul'),
  ol: makeEditable('ol'),
  li: makeEditable('li'),
  a: makeEditable('a'),
  button: makeEditable('button'),
  input: makeEditable('input'),
  textarea: makeEditable('textarea'),
  select: makeEditable('select'),
  option: makeEditable('option'),
  label: makeEditable('label'),
  form: makeEditable('form'),
  fieldset: makeEditable('fieldset'),
  legend: makeEditable('legend'),
  table: makeEditable('table'),
  thead: makeEditable('thead'),
  tbody: makeEditable('tbody'),
  tfoot: makeEditable('tfoot'),
  tr: makeEditable('tr'),
  th: makeEditable('th'),
  td: makeEditable('td'),
  caption: makeEditable('caption'),
  img: makeEditable('img'),
  figure: makeEditable('figure'),
  figcaption: makeEditable('figcaption'),
  blockquote: makeEditable('blockquote'),
  cite: makeEditable('cite'),
  code: makeEditable('code'),
  pre: makeEditable('pre'),
  hr: makeEditable('hr'),
  iframe: makeEditable('iframe'),
  video: makeEditable('video'),
  audio: makeEditable('audio'),
  source: makeEditable('source'),
  canvas: makeEditable('canvas'),
  svg: makeEditable('svg'),
  path: makeEditable('path'),
  circle: makeEditable('circle'),
  rect: makeEditable('rect'),
  polyline: makeEditable('polyline'),
  polygon: makeEditable('polygon'),
  line: makeEditable('line'),
  text: makeEditable('text'),
  g: makeEditable('g'),
  symbol: makeEditable('symbol'),
  mask: makeEditable('mask'),
  clipPath: makeEditable('clipPath'),
  progress: makeEditable('progress'),
  meter: makeEditable('meter'),
  datalist: makeEditable('datalist'),
  details: makeEditable('details'),
  summary: makeEditable('summary'),
  time: makeEditable('time'),
  mark: makeEditable('mark'),
  small: makeEditable('small'),
  strong: makeEditable('strong'),
  em: makeEditable('em'),
  i: makeEditable('i'),
  b: makeEditable('b'),
  u: makeEditable('u'),
  sub: makeEditable('sub'),
  sup: makeEditable('sup'),
  del: makeEditable('del'),
  ins: makeEditable('ins'),
  abbr: makeEditable('abbr'),
  kbd: makeEditable('kbd'),
  samp: makeEditable('samp'),
  var: makeEditable('var'),
  wbr: makeEditable('wbr'),
};




      
              `
        }, {
          name: 'App.js',
          type: 'file',
          path: '/src/App.js',
          content: "/* eslint-disable react/jsx-pascal-case */\nimport { useState } from 'react';\nimport './App.css';\n\nfunction App() {\n  const [todos, setTodos] = useState([]);\n  const [newTodo, setNewTodo] = useState('');\n\n  const addTodo = () => {\n    if (newTodo.trim() !== '') {\n      setTodos([...todos, { text: newTodo, completed: false }]);\n      setNewTodo('');\n    }\n  };\n\n  const toggleComplete = (index) => {\n    const updatedTodos = [...todos];\n    updatedTodos[index].completed = !updatedTodos[index].completed;\n    setTodos(updatedTodos);\n  };\n\n  const removeTodo = (index) => {\n    const updatedTodos = todos.filter((_, i) => i !== index);\n    setTodos(updatedTodos);\n  };\n\n  return (\n    <div className=\"container mx-auto p-4\">\n      <h1 className=\"text-3xl font-bold mb-4\">To-Do List</h1>\n      <div className=\"mb-4\">\n        <input\n          type=\"text\"\n          value={newTodo}\n          onChange={(e) => setNewTodo(e.target.value)}\n          placeholder=\"Add a new to-do\"\n          className=\"border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500\"\n        />\n        <button onClick={addTodo} className=\"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2\">\n          Add\n        </button>\n      </div>\n      <ul>\n        {todos.map((todo, index) => (\n          <li key={index} className=\"flex items-center mb-2\">\n            <input\n              type=\"checkbox\"\n              checked={todo.completed}\n              onChange={() => toggleComplete(index)}\n              className=\"mr-2\"\n            />\n            <span className={todo.completed ? 'line-through text-gray-500' : ''}>\n              {todo.text}\n            </span>\n            <button onClick={() => removeTodo(index)} className=\"bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2\">\n              X\n            </button>\n          </li>\n        ))}\n      </ul>\n      <img src=\"https://images.unsplash.com/photo-1516973377280-a5e5d0497b3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dG9kb3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60\" alt=\"Todo Image\" className=\"mt-8 w-full\" />\n    </div>\n  );\n}\n\nexport default App;\n"
        }

      ]
    }
  ])




  // Set project data when component mounts
  useEffect(() => {
    if (projectData._id) {
      setProject({
        id: projectData._id || '',
        name: projectData.name || '',
        description: projectData.description || '',
        prompt: projectData.prompt || '',
      });

      console.log("propmtpppppp is: ", projectData.prompt);

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
                        export const BACKEND_URL = "https://product-dev-kriti-25.onrender.com/api/v1";
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
  console.log("project data is: ", project);
  const PROJECTID = project.id;
  console.log("PROJECT IS IS: ", PROJECTID);

  console.log("Updated config.js content:", files.find(f => f.name === "src")?.children?.find(f => f.name === "config.js")?.content);


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
    setIsProcessing(true);

    setMessage("Your code will be ready shortly. Please wait...");

    console.log("init function called");
    console.log("prompt is: ", projectData.prompt);

    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: projectData.prompt
    });

    setTemplateSet(true);
    console.log("response of /template is : ", response.data);

    const { prompts, uiPrompts } = response.data;

    //parsing all UI prompt in proper fromat 
    //setting up steps 
    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    console.log("hello all steps are here: ", steps);

    setLoading(true);
    console.log("prompts areeeeee", prompts);


    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, projectData.prompt].map(content => ({
        role: "user",
        content
      }))
    });
    console.log("steps response isssssss: ", stepsResponse.data.response);

    setMessage("Fetched response successfully..");


    const cleanedResponse = stepsResponse.data.response.replace(/```[a-zA-Z]*/g, "");


    console.log("steps response is: ", cleanedResponse);

    setLoading(false);

    // setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
    //   ...x,
    //   status: "pending" as "pending"
    // }))]);
    // console.log("new stpes", steps);

    //Add logic for unique Step IDs:

    setSteps((prevSteps) => {
      const lastStepId = prevSteps.length > 0 ? Math.max(...prevSteps.map(step => step.id)) : 0;
      const newSteps = parseXml(cleanedResponse, lastStepId + 1);
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

    setLlmMessages(x => [...x, { role: "assistant", content: cleanedResponse }])

    setMessage("Now you can see your code in code editor and preview in preview panel.");
    setTimeout(() => {
      setMessage("");
      setIsProcessing(false);
    }, 4000);

  }

  useEffect(() => {
    init(); ////////////////////////////////////////////////////////////////////////////////////////////////////
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
        `https://product-dev-kriti-25.onrender.com/api/v1/project/get-style?projectId=${PROJECTID}`,
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
      }
      );

      console.log('Processed Files:', processedFiles);

      setFiles(processedFiles);

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

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [structuredFiles, setStructuredFiles] = useState<FileItem[]>([]);
  // Fetch project files on-demand (when download button is clicked)
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
      const zipName = `${PROJECTID}-${Date.now()}.zip`; // Project name can be customized as needed
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

  ////////USER NAME////////

  const [user, setUser] = useState<{ name: string; avatar?: string } | null>(null);
  const [name, setName] = useState("");
  const navigate = useNavigate();
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



  return (
    <div className="min-h-screen bg-gray-900 flex flex-col spac">

      {/* <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-400 animate-pulse" />
              <h1 className="ml-2 text-2xl font-bold text-white">Create New Project</h1>
            </div>
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
        </div>
      </header>

      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 space-x-3">

        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {projectData.prompt}</p>
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={handleClick}
          disabled={isProcessing}
        >
          {isProcessing ? "Saving..." : "Save Changes"}
        </button>

        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={handlePreview}
          disabled={isProcessing}
        >
          "Click here to Preview"
        </button>
        <button
          onClick={handleDownloadCode}
          disabled={loading}
          className={`
              w-full md:w-auto px-6 py-3 rounded-lg font-medium
              ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors duration-200
            `}
        >Download Code</button>

        {Message && !isProcessing && <div className={`
              w-1/12 md:w-auto px-6 py-3 rounded-lg font-medium text-white
              ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors duration-200
            `}>{Message}</div>}

        {isProcessing && (
          <div className="mt-2 text-gray-700 font-medium">
            Changes are being made, please wait...
          </div>
        )}

      </header> */}

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
                <p className="text-sm text-gray-400 mt-1">Prompt: {projectData.prompt}</p>
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
                  files={files}
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
                <PreviewFrame webContainer={webcontainer} files={files} />
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
