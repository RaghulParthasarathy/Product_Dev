import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Builder } from './pages/Builder';
import { Landing } from './pages/Landing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;