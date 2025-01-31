import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { PROJECTID, BACKEND_URL }from './config';

// Create context for edit mode
const EditModeContext = createContext();

// Style editor component
const StyleEditor = ({ styles, onStyleChange, onClose, elementType }) => {
  console.log(`Rendering StyleEditor for ${elementType}`, styles);
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
                console.log(`Style change: ${property} = ${e.target.value}`);
                onStyleChange(property, type === 'color' ? e.target.value : `${e.target.value}px`);
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
        console.log(`Registering element ${elementId}`, { styles, content });
        registerElement(elementId, { styles, content });
      }
    }, [editMode]);

    const handleStyleChange = (property, value) => {
      console.log(`Updating styles for element ${elementId}: ${property} = ${value}`);
      const newStyles = { ...styles, [property]: value };
      setStyles(newStyles);
      updateElement(elementId, { styles: newStyles, content });
    };

    const handleContentChange = (e) => {
      const newContent = e.target.innerText;
      console.log(`Updating content for element ${elementId}: ${newContent}`);
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
            console.log(`Opening style editor for element ${elementId}`);
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
              console.log(`Closing style editor for element ${elementId}`);
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
    console.log(`Registering new element: ${id}`, data);
    setElements((prev) => ({ ...prev, [id]: data }));
  };

  const updateElement = (id, data) => {
    console.log(`Updating element ${id}`, data);
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
    const apiUrl = `${BACKEND_URL}/project/save-style?projectId=${projectId}`;
  
    console.log("Sending styleChanges to DB:", transformedJson);
  
    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ styleChanges: transformedJson }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      console.log("Database response:", result);
  
    } catch (error) {
      console.error("Error saving style changes:", error.message);
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
                  console.log(`Edit mode toggled: ${e.target.checked}`);
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
