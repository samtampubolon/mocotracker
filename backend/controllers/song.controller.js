import Song from "../models/song.model.js";
import mongoose from "mongoose";

export const getSongs = async (req, res) => {
    try {
        const songs = await Song.find({}).sort('order');
        res.status(200).json({ success: true, data: songs });
    } catch (error) {
        console.log("error in fetching songs:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createSong = async (req, res) => {
    const song = req.body;

    try {
        // Get the highest order value
        const lastSong = await Song.findOne({}).sort('-order');
        const nextOrder = lastSong ? lastSong.order + 1 : 0;
        const newSong = await Song.create({ ...song, order: nextOrder });
        res.status(201).json({ success: true, data: newSong });
    } catch (error) {
        console.log("error in creating song:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateSong = async (req, res) => {
    const { id } = req.params;
    const song = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({ success:false, message:"Invalid Song Id" });
    }
    try {
       const updatedSong = await Song.findByIdAndUpdate(id, song, { new:true });
       res.status(200).json({ success: true, data: updatedSong });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Song not found"})
    }
};

export const deleteSong = async (req, res) => {
    const {id} = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({ success:false, message:"Invalid Song Id" });
    }
    
    try {
        await Song.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Song deleted" });
    }
    catch(error) {
        console.log("error in deleting song:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const reorderSongs = async (req, res) => {
    const { songs } = req.body;
    try {
        // Update each song's order in parallel
        await Promise.all(songs.map((song, index) => 
            Song.findByIdAndUpdate(song._id, { order: index })
        ));
        res.status(200).json({ success: true, message: "Songs reordered successfully" });
    } catch (error) {
        console.log("error in reordering songs:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};