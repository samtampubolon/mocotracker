import mongoose from "mongoose";

const rehearsalSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Rehearsal = mongoose.model('Rehearsal', rehearsalSchema);

export default Rehearsal;