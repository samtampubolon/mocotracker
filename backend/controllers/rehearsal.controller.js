import Rehearsal from "../models/rehearsal.model.js";
import Task from "../models/task.model.js";
import mongoose from "mongoose";

// Helper function to normalize a date by removing time component
const normalizeDate = (date) => {
    const d = new Date(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const getRehearsals = async (req, res) => {
    try {
        const rehearsals = await Rehearsal.find({})
            .populate({
                path: 'tasks',
                populate: { path: 'song' }
            })
            .sort('date');
        res.status(200).json({ success: true, data: rehearsals });
    } catch (error) {
        console.log("error in fetching rehearsals:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createRehearsal = async (req, res) => {
    const rehearsal = req.body;

    try {
        const normalizedDate = normalizeDate(rehearsal.date);
        const startOfDay = normalizedDate;
        const endOfDay = new Date(normalizedDate);
        endOfDay.setDate(endOfDay.getDate() + 1);

        // Check if a rehearsal already exists for this date
        const existingRehearsal = await Rehearsal.findOne({
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        if (existingRehearsal) {
            return res.status(400).json({
                success: false,
                message: "A rehearsal already exists for this date"
            });
        }

        const newRehearsal = await Rehearsal.create({
            ...rehearsal,
            date: normalizedDate
        });
        const populatedRehearsal = await newRehearsal
            .populate({
                path: 'tasks',
                populate: { path: 'song' }
            });
        res.status(201).json({ success: true, data: populatedRehearsal });
    } catch (error) {
        console.log("error in creating rehearsal:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateRehearsal = async (req, res) => {
    const { id } = req.params;
    const rehearsal = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Rehearsal Id" });
    }

    try {
        const updatedRehearsal = await Rehearsal.findByIdAndUpdate(id, rehearsal, { new: true })
            .populate({
                path: 'tasks',
                populate: { path: 'song' }
            });
        res.status(200).json({ success: true, data: updatedRehearsal });
    } catch (error) {
        console.log("error in updating rehearsal:", error.message);
        res.status(500).json({ success: false, message: "Rehearsal not found" });
    }
};

export const deleteRehearsal = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Rehearsal Id" });
    }

    try {
        await Rehearsal.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Rehearsal deleted" });
    } catch (error) {
        console.log("error in deleting rehearsal:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const addTaskToRehearsal = async (req, res) => {
    const { rehearsalId, taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(rehearsalId) || !mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(404).json({ success: false, message: "Invalid Id" });
    }

    try {
        const rehearsal = await Rehearsal.findById(rehearsalId);
        rehearsal.tasks.push(taskId);
        await rehearsal.save();
        
        const updatedRehearsal = await rehearsal
            .populate({
                path: 'tasks',
                populate: { path: 'song' }
            });
        
        res.status(200).json({ success: true, data: updatedRehearsal });
    } catch (error) {
        console.log("error in adding task to rehearsal:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteTaskFromRehearsal = async (req, res) => {
    const { rehearsalId, taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(rehearsalId) || !mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(404).json({ success: false, message: "Invalid Id" });
    }

    try {
        // First, find and update the rehearsal to remove the task
        const rehearsal = await Rehearsal.findById(rehearsalId);
        if (!rehearsal) {
            return res.status(404).json({ success: false, message: "Rehearsal not found" });
        }

        rehearsal.tasks = rehearsal.tasks.filter(task => task.toString() !== taskId);
        await rehearsal.save();

        // Then, delete the task itself
        await Task.findByIdAndDelete(taskId);

        // Return the complete updated rehearsal with populated tasks
        const updatedRehearsal = await Rehearsal.findById(rehearsalId)
            .populate({
                path: 'tasks',
                populate: { path: 'song' }
            });

        res.status(200).json({ success: true, data: updatedRehearsal });
    } catch (error) {
        console.log("error in deleting task from rehearsal:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};