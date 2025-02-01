[
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
       
/* eslint-disable react/jsx-pascal-case */
import './App.css';

function App() {
  return (
    <div>Hello World</div>
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

  ]