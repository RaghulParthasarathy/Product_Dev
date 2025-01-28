import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // File name (e.g., index.js)
  },
  code: {
    type: String,
    required: true,  // The code stored inside the file
  },
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);

export default File;
