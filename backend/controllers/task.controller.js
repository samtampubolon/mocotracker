import Task from "../models/task.model.js";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({})
            .populate('song')
            .sort('date');
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        console.log("error in fetching tasks:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createTask = async (req, res) => {
    try {
        if (!req.body.song) {
            return res.status(400).json({
                success: false,
                message: "A song reference is required"
            });
        }

        let recordingPath = '';
        if (req.file) {
            // Format the recording URL
            recordingPath = `/uploads/${req.file.filename}`;
        }
        
        const taskData = {
            ...req.body,
            recording: recordingPath
        };

        const newTask = await Task.create(taskData);
        const populatedTask = await newTask.populate('song');
        
        // Double check the song was populated
        if (!populatedTask.song) {
            await Task.findByIdAndDelete(newTask._id);
            if (req.file) {
                fs.unlink(req.file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            return res.status(400).json({
                success: false,
                message: "Invalid song reference"
            });
        }

        res.status(201).json({ success: true, data: populatedTask });
    } catch (error) {
        // Clean up uploaded file if task creation fails
        if (req.file) {
            fs.unlink(req.file.path, err => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.log("error in creating task:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateTask = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Task Id" });
    }

    try {
        const oldTask = await Task.findById(id);
        if (!oldTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        let recordingPath = oldTask.recording;
        if (req.file) {
            // If there's a new file, delete the old one and update the path
            if (oldTask.recording) {
                const oldFilePath = path.join(__dirname, '..', oldTask.recording.replace('/uploads/', ''));
                fs.unlink(oldFilePath, (err) => {
                    if (err && !err.code === 'ENOENT') console.error('Error deleting old file:', err);
                });
            }
            recordingPath = `/uploads/${req.file.filename}`;
        }

        const taskData = {
            ...req.body,
            recording: recordingPath
        };

        const updatedTask = await Task.findByIdAndUpdate(id, taskData, { new: true })
            .populate('song');
        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        // Clean up uploaded file if update fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        console.log("error in updating task:", error.message);
        res.status(500).json({ success: false, message: "Error updating task" });
    }
};

export const deleteTask = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Task Id" });
    }

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Delete the associated file if it exists
        if (task.recording) {
            const filePath = path.join(__dirname, '..', task.recording.replace('/uploads/', ''));
            fs.unlink(filePath, (err) => {
                if (err && !err.code === 'ENOENT') console.error('Error deleting file:', err);
            });
        }

        await Task.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Task deleted" });
    } catch (error) {
        console.log("error in deleting task:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};