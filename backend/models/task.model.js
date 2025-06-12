import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    taskType: {
        type: String,
        required: true,
        enum: ["learn", "run on-book", "run off-book", "workshop", "sectionals", "auditions"]
    },
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: [true, 'A song reference is required'],
        validate: {
            validator: async function(v) {
                const Song = mongoose.model('Song');
                const song = await Song.findById(v);
                return song != null;
            },
            message: 'Referenced song does not exist'
        }
    },
    recording: {
        type: String
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;