import mongoose from "mongoose";
const songSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    soloist:{
        type: String,
        required: true
    },
    conductor:{
        type: String,
        required: true
    },
    vp:{
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true //createdAt, updatedAt
});

const Song = mongoose.model('Song', songSchema);

export default Song;