import User from '../Model/User.js';
import Project from '../Model/Project.js';
import File from '../Model/File.js';

// Controller to update code in a specific file in a project
export const updateFileCode = async (req, res) => {
  const { userId, projectId, fileName, newCode } = req.body;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the project belongs to the user
    if (!user.projects.includes(projectId)) {
      return res.status(403).json({ message: 'User does not have access to this project' });
    }

    // Find the file in the project by file name
    const file = project.files.find((fileId) => {
      return File.findById(fileId).name === fileName;
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update the code in the file
    file.code = newCode;

    // Save the updated file
    await file.save();

    // Return a success response
    return res.status(200).json({
      message: 'File code updated successfully',
      updatedFile: file,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
