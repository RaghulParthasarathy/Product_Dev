// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { Landing } from './pages/Landing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import Signup from './pages/Signup';
import Hello from './pages/Hello';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Landing />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/Hello" element={<Hello />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;