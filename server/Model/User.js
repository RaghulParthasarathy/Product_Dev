import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure email is unique
  },
  password: {
    type: String,
    required: true,  // Store the password (hashed before saving)
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',  // Reference to the Project model
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
