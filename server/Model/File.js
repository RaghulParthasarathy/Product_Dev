import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // File or folder name (e.g., "index.js", "src")
    },
    type: {
      type: String,
      enum: ['file', 'folder'], // Specify if it’s a file or folder
      required: true,
    },
    path: {
      type: String,
      required: true, // Full path to the file or folder (e.g., "/src/index.js")
    },
    content: {
      type: String, // File content (only applicable for files)
      required: function () {
        return this.type === 'file'; // Required if the type is "file"
      },
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File', // Reference to child files or folders
      },
    ],
    projectId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to enforce uniqueness of path within each project
// fileSchema.index({ projectId: 1, path: 1 }, { unique: true });

const File = mongoose.model('File', fileSchema);

export default File;
