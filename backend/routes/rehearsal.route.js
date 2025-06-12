import express from 'express';
import Rehearsal from '../models/rehearsal.model.js';
import Task from '../models/task.model.js';
import {
    getRehearsals,
    createRehearsal,
    updateRehearsal,
    deleteRehearsal,
    addTaskToRehearsal,
    deleteTaskFromRehearsal
} from '../controllers/rehearsal.controller.js';

const router = express.Router();

// Temporary debug endpoint
router.get("/debug/dates", async (req, res) => {
    try {
        const june2025 = new Date(2025, 5); // Month is 0-based, so 5 is June
        const july2025 = new Date(2025, 6);
        
        const rehearsals = await Rehearsal.find({
            date: {
                $gte: june2025,
                $lt: july2025
            }
        }).populate({
            path: 'tasks',
            populate: { path: 'song' }
        });

        res.json({ 
            success: true, 
            data: rehearsals.map(r => ({
                date: r.date,
                id: r._id,
                taskCount: r.tasks.length,
                tasks: r.tasks
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/", getRehearsals);
router.post("/", createRehearsal);
router.put("/:id", updateRehearsal);
router.delete("/:id", deleteRehearsal);
router.post("/:rehearsalId/tasks/:taskId", addTaskToRehearsal);
router.delete("/:rehearsalId/tasks/:taskId", deleteTaskFromRehearsal);
router.delete("/cleanup/empty-rehearsals", async (req, res) => {
    try {
        // Find all rehearsals
        const allRehearsals = await Rehearsal.find({})
            .populate({
                path: 'tasks',
                populate: { path: 'song' }
            });

        // Delete rehearsals that have no tasks
        for (const rehearsal of allRehearsals) {
            if (!rehearsal.tasks || rehearsal.tasks.length === 0) {
                await Rehearsal.findByIdAndDelete(rehearsal._id);
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Empty rehearsals cleaned up" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});
router.put('/:id/tasks/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { tasks } = req.body;

    const rehearsal = await Rehearsal.findById(id);
    if (!rehearsal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rehearsal not found' 
      });
    }

    rehearsal.tasks = tasks.map(task => task._id);
    await rehearsal.save();

    const updatedRehearsal = await Rehearsal.findById(id)
      .populate({
        path: 'tasks',
        populate: {
          path: 'song'
        }
      });

    res.json({ 
      success: true, 
      data: updatedRehearsal.tasks 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Cleanup endpoint for invalid tasks
router.delete("/cleanup/invalid-tasks", async (req, res) => {
    try {
        // Find all tasks and check their song references
        const allTasks = await Task.find().populate('song');
        const invalidTaskIds = allTasks
            .filter(task => !task.song)
            .map(task => task._id);

        if (invalidTaskIds.length > 0) {
            // Delete the invalid tasks
            await Task.deleteMany({ _id: { $in: invalidTaskIds } });
            
            // Update all rehearsals to remove references to deleted tasks
            await Rehearsal.updateMany(
                { tasks: { $in: invalidTaskIds } },
                { $pull: { tasks: { $in: invalidTaskIds } } }
            );
            
            // Delete rehearsals that have no tasks left
            await Rehearsal.deleteMany({ tasks: { $size: 0 } });
        }

        res.json({ 
            success: true, 
            message: `Cleaned up ${invalidTaskIds.length} invalid tasks and their rehearsals` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;