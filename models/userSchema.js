import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password:  {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);

export default User;