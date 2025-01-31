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
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: 'src',
      type: 'folder',
      path: '/src',
      children: [
        {
          name: 'App.js',
          type: 'file',
          path: '/src/App.js',
          content: `
        import { EditModeProvider, Editable } from './editableComponents.js';

/* eslint-disable react/jsx-pascal-case */
import './App.css';

function App() {
  return (
    <EditModeProvider>
      <Editable.div id="20a9f5a2-d1f0-4081-9aa6-aacf65d51c7f" className="App">
        {/* Navbar */}
        <Editable.nav id="dfabd52b-4f14-4e61-9e09-ae91557bbd18" className="Navbar">
          <Editable.ul id="cff1b5e1-b8e1-4c8a-9887-17149a403219">
            <Editable.li id="d0e0cb90-887d-4a1e-876b-be2f785eeb81"><Editable.a id="ec30a6b1-11e7-4101-a227-6e73c2a2f78d" href="#home">Home</Editable.a></Editable.li>
            <Editable.li id="9e010275-479a-444c-9e8d-cffdc3f4b367"><Editable.a id="2a09ef1c-b5d6-4438-a1eb-4df48fbca6ad" href="#about">About</Editable.a></Editable.li>
            <Editable.li id="c3aeafa6-0f55-4bed-b85f-11d64be41b7b"><Editable.a id="22c7c6ab-f988-46f3-93f3-57e42846af6c" href="#contact">Contact</Editable.a></Editable.li>
          </Editable.ul>
        </Editable.nav>

        {/* Main Content */}
        <Editable.main id="cde20925-a0d4-4036-9bd6-6d665eb17ba0" className="Main-content">
          <Editable.h1 id="6c4271aa-9beb-40ac-9b87-0d6103e75643">Welcome to My React Page</Editable.h1>
          <Editable.p id="890069d1-a563-49dd-bda0-0b34e1002f69">This is a simple React.js page with a navbar, a text box, and a styled div.</Editable.p>

          {/* Text Box */}
          <Editable.input id="95c96d4d-df7e-47a3-886f-37a4ccdae0d2"
            className="TextBox"
            type="text"
            placeholder="Enter something..."
          />

          {/* Styled Div */}
          <Editable.div id="3e41afe6-0a58-42ab-90eb-ad98c29927f6" className="Styled-div">
            <Editable.p id="b90996f2-21ea-4e90-bbac-a3b15c9ff978">This is a div with a background color and some text inside it!</Editable.p>
          </Editable.div>
        </Editable.main>
      </Editable.div>
    </EditModeProvider>

  );
}

export default App;
        `
        },
        {
          name: 'index.js',
          type: 'file',
          path: '/src/index.js',
          content: `
        
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


        
        `
        }

        ,
        {
          name: 'App.css',
          type: 'file',
          path: '/src/App.css',
          content: `
        
/* General styling */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

/* Navbar styling */
.Navbar {
  background-color: #333;
  padding: 1rem;
}

.Navbar ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.Navbar ul li a {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
}

.Navbar ul li a:hover {
  text-decoration: underline;
}

/* Main content styling */
.Main-content {
  text-align: center;
  margin: 2rem;
}

.Main-content h1 {
  font-size: 2rem;
  color: #333;
}

.Main-content p {
  font-size: 1.2rem;
  color: #555;
}

/* Textbox styling */
.TextBox {
  margin-top: 1rem;
  padding: 0.5rem;
  width: 50%;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.TextBox:focus {
  outline: none;
  border-color: #333;
}

/* Styled div */
.Styled-div {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f0f8ff; /* Light blue background */
  border: 2px solid #007acc; /* Blue border */
  border-radius: 10px;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.Styled-div p {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  text-align: center;
}



        
        `
        },
        {
          name: 'index.css',
          type: 'file',
          path: '/src/index.css',
          content: `
        
@tailwind base;
@tailwind components;
@tailwind utilities;

        
        `
        },
        {
          name: 'config.js',
          type: 'file',
          path: '/src/config.js',
          content: `
        
export const PROJECTID = "679a26655a84fc483c15b205";
export const BACKEND_URL = "https://509d-14-139-196-209.ngrok-free.app/api/v1";


        
        `
        }
        ,
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

// Export editable components
export const Editable = {
  div: makeEditable('div'),
  p: makeEditable('p'),
  h1: makeEditable('h1'),
  nav: makeEditable('nav'),
  ul: makeEditable('ul'),
  li: makeEditable('li'),
  a: makeEditable('a'),
  main: makeEditable('main'),
  input: makeEditable('input'),
};


        
        `
        
        }

      ]
    },



    {
      name: 'public',
      type: 'folder',
      path: '/public',
      children: [
        {
          name: 'index.html',
          type: 'file',
          path: '/public/index.html',
          content: `
        <!DOCTYPE html>
<html lang="en">
  <head>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

        `
        }

      ]
    },

    {
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      content: `
  {
  "name": "my-react-page",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "axios": "^1.7.9",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cra-template": "1.2.0",
    "lucide-react": "^0.473.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-scripts": "5.0.1",
    "tailwind": "^4.0.0",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^11.0.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17"
  }
}

    `
    },
    {
      name: 'tailwind.config.js',
      type: 'file',
      path: '/tailwind.config.js',
      content: `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
    `
    }
    ,
    {
      name: 'postcss.config.js',
      type: 'file',
      path: '/postcss.config.js',
      content: `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
    `
    }

  ]);

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

  // useEffect(() => {
  //   init();
  // }, [])

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
        `http://localhost:5001/api/v1/project/get-style?projectId=679a26655a84fc483c15b205`,
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
      // const processedFiles = await processFiles(files, PROJECTID);

      // const file = fileInfo.FileData;
      // console.log('file', file);

      // setFiles((prevFiles) => {
      //   // Clone the files array to avoid mutating state directly
      //   let updatedFiles = [...prevFiles];

      //   // Find the `src` folder
      //   let srcFolder = updatedFiles.find((folder) => folder.name === "src" && folder.type === "folder");

      //   if (srcFolder) {
      //     // Ensure children exists and is a new reference (for React state updates)
      //     srcFolder.children = [...(srcFolder.children || []), {
      //       name: file.name,
      //       type: file.type,
      //       children: [], // Ensure children is an array
      //       content: file.content || "", // Ensure content is a string
      //       path: file.path,
      //     }];
      //   }

      // return updatedFiles;
      // });


      // console.log('Processed Files:', processedFiles);

      // setFiles(processedFiles);

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