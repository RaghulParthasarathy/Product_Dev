import { v4 as uuidv4 } from 'uuid';
import { FileItem } from '../types/index.ts';

// List of HTML elements to convert to Editable components
const EDITABLE_ELEMENTS = [
  'div', 'nav', 'ul', 'li', 'a', 'main', 'h1', 'p', 'input',
  'span', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer',
  'section', 'article', 'button', 'form', 'label', 'img',
  'table', 'tr', 'td', 'th',
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
const addUniqueId = (attributes: string | undefined): string => {
  if (!attributes) {
    return ` id="${uuidv4()}"`;
  }

  const hasId = /id=['"]\w+['"]/.test(attributes);
  return hasId ? attributes : ` id="${uuidv4()}" ${attributes.trim()}`;
};

// Convert HTML elements to Editable components with unique IDs
const convertToEditable = (code: string): string => {
  let result = code;

  EDITABLE_ELEMENTS.forEach((element) => {
    // Opening tag regex
    const openingRegex = new RegExp(`<(${element})(\\s+[^>]*)?>`, 'g');
    // Closing tag regex
    const closingRegex = new RegExp(`</(${element})>`, 'g');
    // Self-closing tag regex
    const selfClosingRegex = new RegExp(`<(${element})(\\s+[^>]*)?/\\s*>`, 'g');

    // Replace opening tags
    result = result.replace(openingRegex, (_, tag, attributes) => {
      const updatedAttributes = addUniqueId(attributes);
      return `<Editable.${tag} ${updatedAttributes}>`;
    });

    // Replace self-closing tags
    result = result.replace(selfClosingRegex, (_, tag, attributes) => {
      const updatedAttributes = addUniqueId(attributes);
      return `<Editable.${tag} ${updatedAttributes} />`;
    });

    // Replace closing tags
    result = result.replace(closingRegex, `</Editable.$1>`);
  });

  return result;
};

// Format the JSX code with proper indentation
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

// Function to append the import statement without removing existing headers
const addImportStatement = (code: string): string => {
  const importLine = `import { EditModeProvider, Editable } from './editableComponents.js';\n`;

  return importLine + code;

};

const wrapWithProvider = (code: string): string => {
  // Ensure HTML elements are converted to Editable components
  let processedCode = convertToEditable(code);

  // Add import statement at the top
  processedCode = addImportStatement(processedCode);

  // Split into header (imports, comments) and function body
  const lines = processedCode.split('\n');
  const functionStartIndex = lines.findIndex((line) => line.trim().startsWith('function '));

  if (functionStartIndex === -1) {
    // If no function definition is found, return the processed code as is
    console.warn('No function definition found in the code!');
    return processedCode;
  }

  const headerLines = lines.slice(0, functionStartIndex);
  const functionLines = lines.slice(functionStartIndex).join('\n');

  // Match the function structure in the function lines
  const functionMatch = functionLines.match(
    /(function\s+\w+\(\)\s*{)([\s\S]*?)(return\s*\()([\s\S]*?)(\s*\);?\s*})/
  );

  if (functionMatch) {
    const [_, funcDef, beforeReturn, returnStatement, jsx, closing] = functionMatch;

    // Format the JSX content and wrap it in <EditModeProvider>
    const formattedJsx = formatCode(`
      <EditModeProvider>
        ${jsx}
      </EditModeProvider>
    `);

    // Reconstruct the function with the wrapped JSX
    const wrappedFunction = `${funcDef}${beforeReturn}
  ${returnStatement}
${formattedJsx}
  ${closing}`;

    // Combine the header and the reconstructed function
    return [...headerLines, wrappedFunction].join('\n');
  } else {
    console.warn('Function structure not matched. Returning original function.');
    return processedCode;
  }
};


// Process a single file or folder
const processFileContent = (fileItem: FileItem): FileItem => {
  if (fileItem.type === 'file' && fileItem.content) {
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

// Process an array of files
const processFiles = (files: FileItem[]): FileItem[] => {
  return files.map((file) => processFileContent(file));
};

export {
  processFiles,
  processFileContent,
  wrapWithProvider,
  convertToEditable,
};
