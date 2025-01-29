// import { FileItem } from '../types/FileItem';

// // List of HTML elements to convert to Editable components
// const EDITABLE_ELEMENTS = [
//   'div', 'nav', 'ul', 'li', 'a', 'main', 'h1', 'p', 'input',
//   'span', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer',
//   'section', 'article', 'button', 'form', 'label', 'img',
//   'table', 'tr', 'td', 'th'
// ];

// const isReactComponent = (content: string): boolean => {
//   return (
//     content.includes('return') &&
//     content.includes('(') &&
//     content.includes(')') &&
//     content.includes('<') &&
//     (content.includes('/>') || content.includes('>'))
//   );
// };

// // Convert HTML elements to Editable components with proper formatting
// const convertToEditable = (code: string): string => {
//   let result = code;
  
//   EDITABLE_ELEMENTS.forEach(element => {
//     const openingRegex = new RegExp(`<(${element})(\\s+[^>]*)?>`, 'g');
//     const closingRegex = new RegExp(`</(${element})>`, 'g');
    
//     result = result
//       .replace(openingRegex, `<Editable.$1$2>`)
//       .replace(closingRegex, `</Editable.$1>`);
//   });
  
//   return result;
// };

// // Format the JSX code with proper indentation
// const formatCode = (code: string): string => {
//   let indentLevel = 0;
//   const indentSize = 2;
//   const lines = code.split('\n').map(line => line.trim()).filter(line => line);
  
//   return lines.map(line => {
//     // Decrease indent for closing tags
//     if (line.match(/<\//) || line.match(/^[\s]*}/) || line.match(/^[\s]*\)/)) {
//       indentLevel--;
//     }
    
//     // Add proper indentation
//     const formatted = ' '.repeat(Math.max(0, indentLevel * indentSize)) + line;
    
//     // Increase indent for opening tags
//     if (line.match(/<[^/]/) || line.match(/^[\s]*{/) || line.match(/^[\s]*\(/)) {
//       indentLevel++;
//     }
    
//     return formatted;
//   }).join('\n');
// };

// // Main wrapper function
// const wrapWithProvider = (code: string): string => {
//   let processedCode = convertToEditable(code);
  
//   // Remove any existing imports to prevent duplicates
//   processedCode = processedCode.replace(/import\s+{[\s\S]*?}\s+from\s+['"]\.\/editableComponents\.js['"];?\n?/g, '');
  
//   // Create the header with all necessary imports and comments
//   const header = `/* eslint-disable react/jsx-pascal-case */
// import { EditModeProvider, Editable } from './editableComponents.js';

// `;

//   // Remove any existing eslint disable comments
//   processedCode = processedCode.replace(/\/\*\s*eslint-disable[^*]*\*\/\n?/g, '');
  
//   // Extract the function definition and its content
//   const functionMatch = processedCode.match(/(function\s+\w+\(\)\s*{)([\s\S]*?)(return\s*\()(\s*)([\s\S]*?)(\s*\);?\s*})/);
  
//   if (functionMatch) {
//     const [_, funcDef, beforeReturn, returnStatement, spaces, jsx, closing] = functionMatch;
    
//     // Format the JSX content
//     const formattedJsx = formatCode(`
//       <EditModeProvider>
//         ${jsx}
//       </EditModeProvider>
//     `);
    
//     // Reconstruct the function with proper formatting
//     processedCode = `${funcDef}${beforeReturn}
//   ${returnStatement}
// ${formattedJsx}
//   ${closing}`;
//   }
  
//   return header + processedCode;
// };

// // Process a single file or folder
// const processFileContent = (fileItem: FileItem): FileItem => {
//   if (fileItem.type === 'file' && fileItem.content) {
//     // Only process frontend files with JSX/TSX
//     if (
//       /\.(jsx|tsx)$/.test(fileItem.name) ||
//       (/\.(js|ts)$/.test(fileItem.name) && isReactComponent(fileItem.content))
//     ) {
//       if (isReactComponent(fileItem.content)) {
//         // Check if file has HTML elements that need to be editable
//         const hasHTMLElements = EDITABLE_ELEMENTS.some(
//           element => new RegExp(`<${element}[\\s>]`).test(fileItem.content!)
//         );

//         if (hasHTMLElements) {
//           const processedContent = wrapWithProvider(fileItem.content);
//           return {
//             ...fileItem,
//             content: processedContent
//           };
//         }
//       }
//     }
//   }

//   // Process children recursively if it's a folder
//   if (fileItem.children) {
//     return {
//       ...fileItem,
//       children: fileItem.children.map(child => processFileContent(child))
//     };
//   }

//   return fileItem;
// };

// // Process array of files
// const processFiles = (files: FileItem[]): FileItem[] => {
//   return files.map(file => processFileContent(file));
// };

// export {
//   processFiles,
//   processFileContent,
//   wrapWithProvider,
//   convertToEditable
// };