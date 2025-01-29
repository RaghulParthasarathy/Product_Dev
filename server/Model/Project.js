import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File', // Reference to the File model
      },
    ],
    styleChanges: {
      type: mongoose.Schema.Types.Mixed, // Stores the JSON object directly
      required: false,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
