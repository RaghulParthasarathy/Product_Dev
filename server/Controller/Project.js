import User from '../Model/User.js';
import Project from '../Model/Project.js';
import File from '../Model/File.js';

// // Controller to create a new project and add files to it
// export const createProject = async (req, res) => {
//   const { userId, projectName, projectDescription } = req.body;

//   try {
//     // Validate input
//     if (!userId || !projectName) {
//       return res.status(400).json({ message: 'User ID and project name are required' });
//     }

//     // Find the user by ID
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Create a new project
//     const newProject = new Project({
//       name: projectName,
//       description: projectDescription || '', // Default to an empty string if no description is provided
//       files: [], // Files can be added later
//     });

//     // Save the project
//     await newProject.save();

//     // Add the project to the user's projects array
//     user.projects = user.projects || []; // Ensure the projects array exists
//     user.projects.push(newProject._id);
//     await user.save();

//     // Respond with the created project
//     return res.status(201).json({
//       message: 'Project created successfully',
//       project: newProject,
//     });
//   } catch (err) {
//     console.error('Error creating project:', err.message);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

export const getStyle = async (req, res) => {
  const { projectId } = req.body;

  try {
    // Validate input
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Find the project by ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Respond with the styleChanges JSON
    res.status(200).json({ styleChanges: project.styleChanges });
  } catch (err) {
    console.error(`Error fetching style changes: ${err.message}`);
    res.status(500).json({ error: "Server error, unable to fetch style changes" });
  }
};

export const updateStyle = async (req, res) => {
  const { projectId, updatedStyles } = req.body;

  try {
    // Validate input
    if (!projectId || !updatedStyles) {
      return res.status(400).json({ error: 'Project ID and updated styles are required' });
    }

    // Find and update the project's styleChanges field
    const project = await Project.findByIdAndUpdate(
      projectId,
      { styleChanges: updatedStyles },
      { new: true } // Return the updated document
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ message: 'Style JSON file updated successfully', project });
  } catch (err) {
    console.error(`Error updating style JSON: ${err.message}`);
    res.status(500).json({ error: 'Server error, unable to update style JSON' });
  }
};


export const uploadFile = async (req, res) => {
  const { projectId, name, path, content, type } = req.body;
  console.log("Upload request received:", req.body);

  try {
    // Validate input
    if (!projectId || !name || !path || !type) {
      console.log("Validation error: Missing required fields");
      return res.status(400).json({ error: 'Project ID, file name, path, and type are required' });
    }

    // // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      console.log("Project not found");
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log("Project found:", project.name);

    // // Check if a file with the same path already exists within the project
    // const existingFile = await File.findOne({ projectId, path });
    // if (existingFile) {
    //   console.log("File with the same path already exists:", path);
    //   return res.status(400).json({ error: 'A file with this path already exists in the project' });
    // }

    // Create a new file
    const newFile = new File({
      name,
      path,
      type,
      content: type === 'file' ? content : undefined, // Add content only for files
      children: type === 'folder' ? [] : undefined, // Add children only for folders
      projectId, 
    });

    console.log("Creating new file:", newFile);

    await newFile.save();

    project.files.push(newFile._id);
    await project.save();

    console.log("File uploaded successfully:", newFile);

    // Return success response
    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile,
    });
  } catch (err) {
    console.error(`Error uploading file: ${err.message}`);
    res.status(500).json({ error: 'Server error, unable to upload file' });
  }
};


export const deleteAllFiles = async (req, res) => {
  const { projectId } = req.query;
  
  console.log('Delete all files request:', req.query);

  try {
    // Validate input
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete all files associated with the project
    const filesToDelete = project.files;
    await File.deleteMany({ _id: { $in: filesToDelete } });

    // Clear the project's files array
    project.files = [];
    await project.save();

    res.status(200).json({ message: 'All files deleted successfully', project });
  } catch (err) {
    console.error(`Error deleting files: ${err.message}`);
    res.status(500).json({ error: 'Server error, unable to delete files' });
  }
};

export const updateFile = async (req, res) => {
  const { projectId, path, content } = req.body;

  console.log('Update request:', req.body);

  try {
    // Validate input
    if (!projectId || !path || typeof content === 'undefined') {
      return res.status(400).json({ error: 'Project ID, file path, and content are required' });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Project found: in update request', project.name);

    // Find the file by projectId and path
    const file = await File.findOne({ projectId, path });
    console.log('File found:in update request ', file.name, file.content);

    if (!file) {
      return res.status(404).json({ error: 'File not found in the specified project' });
    }


    // Update the file content
    file.content = content;
    await file.save();

    console.log('File updated successfully:', file);

    res.status(200).json({
      message: 'File updated successfully',
      file,
    });
  } catch (err) {
    console.error(`Error updating file: ${err.message}`);
    res.status(500).json({ error: 'Server error, unable to update file' });
  }
};

export const getFiles = async (req, res) => {
  const { projectId } = req.query;

  try {
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // if (!mongoose.Types.ObjectId.isValid(projectId)) {
    //   return res.status(400).json({ error: 'Invalid Project ID' });
    // }

    const project = await Project.findById(projectId).populate('files');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Files fetched successfully', project.files)

    res.status(200).json({
      message: 'Files fetched successfully',
      files: project.files,
    });

  } catch (err) {
    console.error(`Error fetching files: ${err.message}`);
    res.status(500).json({ error: 'Server error, unable to fetch files' });
  }
};

export const checkFileExists = async (req, res) => {
  const { projectId, path } = req.query;

  try {
    if (!projectId || !path) {
      return res.status(400).json({ error: 'Project ID and file path are required' });
    }

    const file = await File.findOne({ projectId, path });

    res.status(200).json({ exists: !!file });
  } catch (error) {
    console.error('Error checking file existence:', error.message);
    res.status(500).json({ error: 'Server error while checking file existence' });
  }
};


export const deleteFile = async (req, res) => {
  const { projectId, path } = req.body;

  try {
    if (!projectId || !path) {
      return res.status(400).json({ error: 'Project ID and file path are required' });
    }

    const file = await File.findOneAndDelete({ projectId, path });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Remove the file reference from the project
    await Project.findByIdAndUpdate(projectId, {
      $pull: { files: file._id },
    });

    res.status(200).json({ message: 'File deleted successfully', file });
  } catch (error) {
    console.error('Error deleting file:', error.message);
    res.status(500).json({ error: 'Server error while deleting file' });
  }
};


export const updateProjectStyleChanges = async (req, res) => {
  try {
    const { projectId } = req.query;
    const { styleChanges } = req.body;
    console.log("rq query in put-style is: ",req.query);

    // // Validate project ID
    // if (!mongoose.Types.ObjectId.isValid(projectId)) {
    //   return res.status(400).json({ message: 'Invalid project ID' });
    // }

    // Find and update project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { styleChanges },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({
      message: 'Style changes updated successfully',
      project: updatedProject,
    });

  } catch (error) {
    console.error('Error updating styleChanges:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjectStyleChanges = async (req, res) => {
  try {
    const { projectId } = req.query;

    // if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    //   return res.status(400).json({ message: 'Invalid or missing project ID' });
    // }

    const project = await Project.findById(projectId, 'styleChanges');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({
      message: 'Style changes retrieved successfully',
      styleChanges: project.styleChanges || {},
    });

  } catch (error) {
    console.error('Error fetching styleChanges:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getAllProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching all projects for user: ${userId}`);
    const projects = await Project.find({ userId }).populate("files");
    console.log("Projects found:", projects);

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    console.log(`[getProjectById] Fetching project with ID: ${projectId}`);

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.status(200).json({
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
    });
  } catch (error) {
    console.error("[getProjectById] Error:", error);
    res.status(500).json({ error: "Failed to fetch project details." });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId; // Get userId from JWT

    if (!name) {
      return res.status(400).json({ error: "Project name is required." });
    }

    console.log(`Creating project for user: ${userId}`);
    console.log("Project details:", { name, description });

    const newProject = new Project({
      name,
      description,
      userId,
    });

    await newProject.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.projects.push(newProject._id); // Add project ID to user’s projects
    await user.save();

    console.log("Project successfully created and added to user profile");

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// Controller to delete a project and all associated files
export const deleteProject = async (req, res) => {
  const { userId, projectId } = req.body; // Assuming these are sent in the body

  try {
    // Find the project by ID and ensure it belongs to the user
    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to delete this project' });
    }

    // Delete all associated files from the File model
    await File.deleteMany({ projectId });

    // Remove the project ID from the user's projects array
    await User.updateOne({ _id: userId }, { $pull: { projects: projectId } });

    // Delete the project itself
    await Project.deleteOne({ _id: projectId });

    return res.status(200).json({ message: 'Project and associated files successfully deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong while deleting the project' });
  }
};
