export const basePrompt = `Here is an artifact that contains all files of the project visible to you. Make sure to give me output in the given below format 
in <boltAction> and <boltArtifact> tag you can find the format below. so that I can extract it easily using my script file... 
Consider the contents of ALL files in the project.

<boltArtifact id="project-import" title="Project Files">

<boltAction type="file" filePath="package.json">
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
</boltAction>

<boltAction type="file" filePath="tailwind.config.js">
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
</boltAction>

<boltAction type="file" filePath="postcss.config.js">
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
</boltAction>

<boltAction type="file" filePath="public/index.html">
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
</boltAction>

<boltAction type="file" filePath="src/index.js">
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
</boltAction>

<boltAction type="file" filePath="src/index.css">
@tailwind base;
@tailwind components;
@tailwind utilities;
</boltAction>

<boltAction type="file" filePath="src/App.js">
/* eslint-disable react/jsx-pascal-case */
import './App.css';

function App() {
  return (
    <div>Hello World</div>
  );
}

export default App;
</boltAction>

<boltAction type="file" filePath="src/App.css">
/* General styling */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
</boltAction>

</boltArtifact>

I am **very particular about my project's file structure**. You **must not modify** any files except \`App.js\` and \`App.css\`. All other files should remain exactly as they are.

### Guidelines:
- Ensure all webpage designs are **visually stunning, unique, and production-ready**—no generic or cookie-cutter layouts.
- Use **React (.js syntax)**, **Lucide React** for icons, and **React Hooks** where needed.
- Do **not** install any additional UI libraries, themes, or icon packs unless explicitly requested.
- Use **stock photos from Unsplash**, linking only valid URLs inside \`<img>\` tags. Do **not** download or embed images.
- The AI **must adhere strictly** to the provided file structure, making modifications **only** in \`App.js\` and \`App.css\`.

### File Structure (Do Not Alter Except \`App.js\` & \`App.css\`):

\`\`\`
/src  
  ├── App.js  (modifiable)  
  ├── index.js  (do not modify)  
  ├── App.css  (modifiable)  
  ├── index.css  (do not modify)  
/public  
  ├── index.html  (do not modify)  
/package.json  (do not modify)  
/tailwind.config.js  (do not modify)  
/postcss.config.js  (do not modify)  
\`\`\`

`
