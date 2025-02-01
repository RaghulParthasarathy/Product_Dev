import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { FileItem } from '../types/index.ts';
import { BACKEND_URL } from '../config';
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

// const EDITABLE_ELEMENTS = [
//   'div', 'nav', 'ul', 'li', 'a', 'main', 'h1', 'p', 'input',
//   'span', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer',
//   'section', 'article', 'button', 'form', 'label', 'img',
//   'table', 'tr', 'td', 'th'
// ];

const EDITABLE_ELEMENTS = [
  'div', 'nav', 'ul', 'li', 'a', 'main', 'h1', 'p','h2', 'h3', 'h4', 'h5', 'h6'
];

// Check if the content is a React component
const isReactComponent = (content: string): boolean => {
  return (
    content.includes('return') &&
    content.includes('(') &&
    content.includes(')') &&
    content.includes('<') &&
    (content.includes('/>') || content.includes('>'))
  );
};

// Add a unique ID to an element only if it doesn't already have an ID
// const addUniqueId = (attributes: string | undefined): string => {
//   if (!attributes || attributes.trim() === "") {
//     return ` id="${uuidv4()}"`; // ✅ If no attributes exist, return only the id
//   }

//   // ✅ Check if the `id` attribute exists
//   const hasId = /\bid=['"][^'"]+['"]/.test(attributes);

//   return hasId ? attributes : `${attributes.trim()} id="${uuidv4()}"`;
// };

const addUniqueId = (attributes: string | undefined): string => {
  if (!attributes || attributes.trim() === "") {
    return ` id="${uuidv4()}"`; // ✅ No attributes? Just add an ID.
  }

  // ✅ Ensure existing ID is not duplicated
  const hasId = /\bid=['"][^'"]+['"]/.test(attributes);
  return hasId ? attributes : `${attributes.trim()} id="${uuidv4()}"`;
};

// const convertToEditable = (code: string): string => {
//   let result = code;

//   EDITABLE_ELEMENTS.forEach((element) => {
//     // Match opening tags (e.g., <div className="test">)
//     const openingRegex = new RegExp(`<(${element})(\\s*[^>/]*)?>`, 'g');
//     // Match closing tags (e.g., </div>)
//     const closingRegex = new RegExp(`</(${element})>`, 'g');
//     // Match self-closing elements (e.g., <input />)
//     const selfClosingRegex = new RegExp(`<(${element})(\\s*[^>]*)?/\\s*>`, 'g');

//     // ✅ Process normal opening tags
//     result = result.replace(openingRegex, (_, tag, attributes) => {
//       const updatedAttributes = addUniqueId(attributes);
//       return `<Editable.${tag}${updatedAttributes}>`;
//     });

//     // ✅ Process self-closing tags correctly
//     result = result.replace(selfClosingRegex, (_, tag, attributes) => {
//       const updatedAttributes = addUniqueId(attributes);
//       return `<Editable.${tag}${updatedAttributes} />`;
//     });

//     // ✅ Process closing tags
//     result = result.replace(closingRegex, `</Editable.$1>`);
//   });

//   return result;
// };



// Format JSX code with proper indentation


const convertToEditable = (code: string): string => {
  console.log("Original Code:", code);

  // ✅ Parse JSX code using Babel
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  // ✅ Traverse AST and modify JSX elements
  traverse(ast, {
    JSXOpeningElement(path) {
      const tagName = path.node.name;
      if (t.isJSXIdentifier(tagName) && EDITABLE_ELEMENTS.includes(tagName.name)) {
        // ✅ Wrap element with Editable.*
        path.node.name = t.jsxMemberExpression(
          t.jsxIdentifier("Editable"),
          t.jsxIdentifier(tagName.name)
        );

        // ✅ Check if the element already has an `id` attribute
        const hasId = path.node.attributes.some(
          (attr) => t.isJSXAttribute(attr) && attr.name.name === "id"
        );

        if (!hasId) {
          path.node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier("id"), t.stringLiteral(uuidv4()))
          );
        }
      }
    },

    // ✅ Ensure closing tags are also transformed
    JSXClosingElement(path) {
      const tagName = path.node.name;
      if (t.isJSXIdentifier(tagName) && EDITABLE_ELEMENTS.includes(tagName.name)) {
        path.node.name = t.jsxMemberExpression(
          t.jsxIdentifier("Editable"),
          t.jsxIdentifier(tagName.name)
        );
      }
    },

    // ✅ Preserve parentheses around return JSX
    ReturnStatement(path) {
      if (t.isJSXElement(path.node.argument) || t.isJSXFragment(path.node.argument)) {
        path.node.argument = t.parenthesizedExpression(path.node.argument);
      }
    },
  });

  // ✅ Convert AST back to JSX code
  const transformedCode = generate(ast, { retainLines: true }).code;

  console.log("Transformed Code:", transformedCode);
  return transformedCode;
};



const formatCode = (code: string): string => {
  let indentLevel = 0;
  const indentSize = 2;
  const lines = code.split('\n').map((line) => line.trim()).filter((line) => line);

  return lines
    .map((line) => {
      if (line.match(/<\//) || line.match(/^[\s]*}/) || line.match(/^[\s]*\)/)) {
        indentLevel--;
      }

      const formatted = ' '.repeat(Math.max(0, indentLevel * indentSize)) + line;

      if (line.match(/<[^/]/) || line.match(/^[\s]*{/) || line.match(/^[\s]*\(/)) {
        indentLevel++;
      }

      return formatted;
    })
    .join('\n');
};

// Add import statement
const addImportStatement = (code: string): string => {
  const importLine = `import { EditModeProvider, Editable } from './editableComponents.js';\n`;
  return importLine + code;
};

// Wrap JSX content with <EditModeProvider>
// const wrapWithProvider = (code: string): string => {
//   let processedCode = convertToEditable(code);
//   processedCode = addImportStatement(processedCode);
//   console.log("Processed Code:", processedCode);
//   const lines = processedCode.split('\n');
//   const functionStartIndex = lines.findIndex((line) => line.trim().startsWith('function '));

//   if (functionStartIndex === -1) {
//     console.warn('No function definition found in the code!');
//     return processedCode;
//   }

//   const headerLines = lines.slice(0, functionStartIndex);
//   const functionLines = lines.slice(functionStartIndex).join('\n');

//   const functionMatch = functionLines.match(
//     /(function\s+\w+\(\)\s*{)([\s\S]*?)(return\s*\()([\s\S]*?)(\s*\);?\s*})/
//   );

//   if (functionMatch) {
//     const [_, funcDef, beforeReturn, returnStatement, jsx, closing] = functionMatch;

//     const formattedJsx = formatCode(`
//       <EditModeProvider>
//         ${jsx}
//       </EditModeProvider>
//     `);

//     const wrappedFunction = `${funcDef}${beforeReturn}
//   ${returnStatement}
// ${formattedJsx}
//   ${closing}`;

//     return [...headerLines, wrappedFunction].join('\n');
//   } else {
//     console.warn('Function structure not matched. Returning original function.');
//     return processedCode;
//   }
// };

const wrapWithProvider = (code: string): string => {
  let processedCode = convertToEditable(code);
  processedCode = addImportStatement(processedCode);
  console.log("Processed Code:", processedCode);
  console.log("Original Code:", processedCode);
  code = processedCode;

  // ✅ Parse the code into an AST
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  // ✅ Traverse the AST and find return statements
  traverse(ast, {
    ReturnStatement(path) {
      if (t.isJSXElement(path.node.argument) || t.isJSXFragment(path.node.argument)) {
        // ✅ Wrap JSX inside <EditModeProvider>
        const wrappedJSX = t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier("EditModeProvider"), []),
          t.jsxClosingElement(t.jsxIdentifier("EditModeProvider")),
          [path.node.argument] // Keep the original JSX inside
        );

        // ✅ Force parentheses around return statement to prevent syntax errors
        path.node.argument = t.parenthesizedExpression(wrappedJSX);
      }
    },
  });

  // ✅ Convert AST back to JSX code
  const transformedCode = generate(ast, { retainLines: true }).code;

  console.log("Transformed Code:", transformedCode);
  return transformedCode;
};

// Process a single file or folder
const processFileContent = (fileItem: FileItem): FileItem => {
  console.log('Processing file:', fileItem.path);
  if (fileItem.type === 'file' && fileItem.content) {
      // Skip processing if the file name is 'editableComponents.js'
    if (fileItem.name === 'editableComponents.js') {
      console.log(`Skipping processing for ${fileItem.name}`);
      return fileItem; // Return the file as is, without modifications
    }

    if (
      /\.(jsx|tsx)$/.test(fileItem.name) ||
      (/\.(js|ts)$/.test(fileItem.name) && isReactComponent(fileItem.content))
    ) {
      if (isReactComponent(fileItem.content)) {
        const hasHTMLElements = EDITABLE_ELEMENTS.some((element) =>
          new RegExp(`<${element}[\\s>]`).test(fileItem.content!)
        );

        if (hasHTMLElements) {
          const processedContent = wrapWithProvider(fileItem.content);
          return {
            ...fileItem,
            content: processedContent,
          };
        }
      }
    }
  }

  if (fileItem.children) {
    return {
      ...fileItem,
      children: fileItem.children.map((child) => processFileContent(child)),
    };
  }

  return fileItem;
};

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


// Process an array of files and handle backend sync
const processFiles = async (files: FileItem[], projectId: string): Promise<FileItem[]> => {
  console.log('Processing files for project:', projectId);
  
  const processedFiles = files.map((file) => processFileContent(file));
  console.log('Files processed:', processedFiles);

  await deleteAllFiles(projectId);

  await uploadFiles(processedFiles, projectId);

  console.log('Processing complete for project:', projectId);
  return processedFiles;
};




export {
  processFiles,
  processFileContent,
  wrapWithProvider,
  convertToEditable,
};
