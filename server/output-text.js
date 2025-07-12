export const outputData = { text : `\`\`\`xml
  <genwebArtifact id="project-import" title="Project Files">
  
  <genwebAction type="file" filePath="src/App.js">
  \`\`\`javascript
  /* eslint-disable react/jsx-pascal-case */
  import './App.css';
  import { LucideSun } from 'lucide-react';
  
  function App() {
    return (
      <div className="container mx-auto p-4">
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Blog</h1>
          <LucideSun className="h-6 w-6"/>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <article className="bg-white rounded-lg shadow-md p-4">
            <img src="https://images.unsplash.com/photo-1661956602-a205a60a209a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGJsb2d8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60" alt="Blog Post 1" className="w-full h-48 object-cover rounded-t-lg mb-2"/>
            <h2 className="text-xl font-bold mb-2">Blog Post 1</h2>
            <p className="text-gray-700">This is a sample blog post. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </article>
          <article className="bg-white rounded-lg shadow-md p-4">
            <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YmxvZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60" alt="Blog Post 2" className="w-full h-48 object-cover rounded-t-lg mb-2"/>
            <h2 className="text-xl font-bold mb-2">Blog Post 2</h2>
            <p className="text-gray-700">This is another sample blog post.  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </article>
          <article className="bg-white rounded-lg shadow-md p-4">
            <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a85e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGJsb2d8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60" alt="Blog Post 3" className="w-full h-48 object-cover rounded-t-lg mb-2"/>
            <h2 className="text-xl font-bold mb-2">Blog Post 3</h2>
            <p className="text-gray-700">Yet another sample blog post. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </article>
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-8 text-center">
          &copy; 2024 My Blog
        </footer>
      </div>
    );
  }
  
  export default App;
  \`\`\`
  </genwebAction>
  
  <genwebAction type="file" filePath="src/App.css">
  \`\`\`css
  /* General styling */
  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
  }
  
  .container {
    max-width: 1200px;
  }
  
  article img {
    transition: transform 0.3s;
  }
  
  article:hover img {
    transform: scale(1.05);
  }
  \`\`\`
  </genwebAction>
  
  </genwebArtifact>
  \`\`\`
  ` };
  
