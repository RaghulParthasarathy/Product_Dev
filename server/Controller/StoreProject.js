import User from '../models/User.js';
import Project from '../models/Project.js';
import File from '../models/File.js';

// Controller to create a new project and add files to it
export const createProject = async (req, res) => {
  const { userId, projectName, projectDescription, files } = req.body;  // Files should be an array of { name, code }

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new project
    const newProject = new Project({
      name: projectName,
      description: projectDescription,
      files: [],  // Files will be added later
    });

    // Save the project
    await newProject.save();

    // Process each file
    const fileIds = []; // To store the IDs of files created
    for (const file of files) {
      const newFile = new File({
        name: file.name,
        code: file.code,
      });

      // Save the file and add it to the project's files array
      await newFile.save();
      fileIds.push(newFile._id); // Store file ID

      // Add the file to the project
      newProject.files.push(newFile._id);
    }

    // Save the project with file references
    await newProject.save();

    // Add the project to the user's projects array
    user.projects.push(newProject._id);
    await user.save();

    // Respond with the created project
    return res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
