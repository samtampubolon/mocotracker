import { create } from 'zustand';

export const useSongStore = create((set) => ({
    songs: [],
    setSongs: (songs) => set({ songs }),
    createSong: async (newSong) => {
        try {
            if (!newSong.title || !newSong.soloist || !newSong.conductor || !newSong.vp) {
                return { success: false, message: "Please fill in all fields." }
            }
            const res = await fetch('/api/songs', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newSong),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            set((state) => ({ songs: [...state.songs, data.data] }));
            return { success: true, message: "Song added successfully" };
        } catch (error) {
            console.error('Error adding song:', error);
            return { success: false, message: error.message };
        }
    },
    deleteSong: async (id) => {
        try {
            const res = await fetch(`/api/songs/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            set(state => ({ songs: state.songs.filter(song => song._id !== id)}));
            return { success: true, message: "Song deleted successfully" };
        } catch (error) {
            console.error('Error deleting song:', error);
            return { success: false, message: error.message };
        }
    },
    fetchSongs: async () => {
        const res = await fetch('/api/songs');
        const data = await res.json();
        set({ songs: data.data });
    },
    updateSong: async (pid, updatedSong) => {
        const res = await fetch(`/api/songs/${pid}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSong),
        });
        const data = await res.json();
        if (!data.success) return { success: false, message: data.message };

        set((state) => ({
            songs: state.songs.map((song) => (song._id === pid ? data.data : song)),
        }));

        return { success: true, message: data.message };
    },
    reorderSongs: async (songs) => {
        try {
            const res = await fetch('/api/songs/reorder/songs', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ songs }),
            });
            
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            set({ songs }); // Update local state immediately
            return { success: true, message: "Songs reordered successfully" };
        } catch (error) {
            console.error('Error reordering songs:', error);
            return { success: false, message: error.message };
        }
    },
}))