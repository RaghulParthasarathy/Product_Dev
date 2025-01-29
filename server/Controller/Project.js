import User from '../Model/User.js';
import Project from '../Model/Project.js';
import File from '../Model/File.js';

// Controller to create a new project and add files to it
export const createProject = async (req, res) => {
  const { userId, projectName, projectDescription } = req.body;

  try {
    // Validate input
    if (!userId || !projectName) {
      return res.status(400).json({ message: 'User ID and project name are required' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new project
    const newProject = new Project({
      name: projectName,
      description: projectDescription || '', // Default to an empty string if no description is provided
      files: [], // Files can be added later
    });

    // Save the project
    await newProject.save();

    // Add the project to the user's projects array
    user.projects = user.projects || []; // Ensure the projects array exists
    user.projects.push(newProject._id);
    await user.save();

    // Respond with the created project
    return res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (err) {
    console.error('Error creating project:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

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

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      console.log("Project not found");
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log("Project found:", project.name);

    // Check if a file with the same path already exists within the project
    const existingFile = await File.findOne({ projectId, path });
    if (existingFile) {
      console.log("File with the same path already exists:", path);
      return res.status(400).json({ error: 'A file with this path already exists in the project' });
    }

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