import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
    },
    taskId: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED'],
        default: 'PENDING',
    },
    modelUrl: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;

