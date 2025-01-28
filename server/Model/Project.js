import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Project name
  },
  description: {
    type: String,
    required: false,  // Optional project description
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',  // Reference to the File model
  }],
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;
