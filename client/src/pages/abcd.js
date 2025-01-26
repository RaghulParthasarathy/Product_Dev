import { useEffect } from 'react';
import { wrapWithProvider } from './script';

// List of HTML elements we want to make editable
const EDITABLE_ELEMENTS = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'nav', 'header', 'footer', 'main', 'section', 'article',
  'ul', 'ol', 'li', 'a', 'button', 'input', 'form', 'label',
  'img', 'table', 'tr', 'td', 'th'
];

const isReactComponent = (content: string): boolean => {
  // Check if the file contains React component indicators
  return (
    content.includes('return') &&
    content.includes('(') &&
    content.includes(')') &&
    content.includes('<') &&
    content.includes('/>') || content.includes('>')
  );
};

const processFileContent = (fileItem: FileItem): FileItem => {
  if (fileItem.type === 'file' && fileItem.content) {
    // Only process frontend files with JSX/TSX
    if (
      /\.(jsx|tsx)$/.test(fileItem.name) || 
      (
        /\.(js|ts)$/.test(fileItem.name) && 
        isReactComponent(fileItem.content)
      )
    ) {
      let processedContent = fileItem.content;
      
      // Only proceed if it looks like a React component
      if (isReactComponent(processedContent)) {
        // Add import only if we find HTML elements that need to be editable
        const hasHTMLElements = EDITABLE_ELEMENTS.some(
          element => new RegExp(`<${element}[\\s>]`).test(processedContent)
        );

        if (hasHTMLElements) {
          // Add import statement at the beginning
          const importStatement = `import { EditModeProvider, Editable } from './editableComponents.js';\n\n`;
          
          if (!processedContent.includes('eslint-disable')) {
            processedContent = '/* eslint-disable react/jsx-pascal-case */\n' + processedContent;
          }
          
          // Wrap the content using the script function
          processedContent = wrapWithProvider(processedContent);
          
          // Only convert specific HTML elements to Editable components
          EDITABLE_ELEMENTS.forEach(element => {
            const elementRegex = new RegExp(`<(${element})(\\s+[^>]*)?>`, 'g');
            const closingElementRegex = new RegExp(`</(${element})>`, 'g');
            
            processedContent = processedContent
              .replace(elementRegex, `<Editable.$1$2>`)
              .replace(closingElementRegex, `</Editable.$1>`);
          });
          
          return {
            ...fileItem,
            content: importStatement + processedContent
          };
        }
      }
    }
  }

  // Process children recursively if it's a folder
  if (fileItem.children) {
    return {
      ...fileItem,
      children: fileItem.children.map(child => processFileContent(child))
    };
  }

  return fileItem;
};

const useFileProcessor = (files: FileItem[], setFiles: (files: FileItem[]) => void) => {
  useEffect(() => {
    const processFiles = () => {
      const processedFiles = files.map(file => processFileContent(file));
      setFiles(processedFiles);
    };

    if (files.length > 0) {
      processFiles();
    }
  }, [files, setFiles]);
};

export default useFileProcessor;