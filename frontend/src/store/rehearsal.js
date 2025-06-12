import { create } from 'zustand';

export const useRehearsalStore = create((set, get) => ({
    rehearsals: [],
    setRehearsals: (rehearsals) => set({ rehearsals }),
    
    createRehearsal: async (newRehearsal) => {
        try {
            if (!newRehearsal.date) {
                return { success: false, message: "Date is required." }
            }
            const res = await fetch('/api/rehearsals', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newRehearsal),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            set((state) => ({ rehearsals: [...state.rehearsals, data.data] }));
            return { success: true, data: data.data, message: "Rehearsal created successfully" };
        } catch (error) {
            console.error('Error creating rehearsal:', error);
            return { success: false, message: error.message };
        }
    },

    fetchRehearsals: async () => {
        try {
            const res = await fetch('/api/rehearsals');
            const data = await res.json();
            set({ rehearsals: data.data });
            return { success: true };
        } catch (error) {
            console.error('Error fetching rehearsals:', error);
            return { success: false, message: error.message };
        }
    },

    updateRehearsal: async (id, updatedRehearsal) => {
        try {
            const res = await fetch(`/api/rehearsals/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedRehearsal),
            });
            const data = await res.json();
            if (!data.success) return { success: false, message: data.message };

            set((state) => ({
                rehearsals: state.rehearsals.map((rehearsal) => 
                    rehearsal._id === id ? data.data : rehearsal
                ),
            }));

            return { success: true, message: "Rehearsal updated successfully" };
        } catch (error) {
            console.error('Error updating rehearsal:', error);
            return { success: false, message: error.message };
        }
    },

    deleteRehearsal: async (id) => {
        try {
            const res = await fetch(`/api/rehearsals/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            set(state => ({ 
                rehearsals: state.rehearsals.filter(rehearsal => rehearsal._id !== id)
            }));
            return { success: true, message: "Rehearsal deleted successfully" };
        } catch (error) {
            console.error('Error deleting rehearsal:', error);
            return { success: false, message: error.message };
        }
    },

    addTaskToRehearsal: async (rehearsalId, taskId) => {
        try {
            const res = await fetch(`/api/rehearsals/${rehearsalId}/tasks/${taskId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            const data = await res.json();
            if (!data.success) return { success: false, message: data.message };

            set((state) => ({
                rehearsals: state.rehearsals.map((rehearsal) => 
                    rehearsal._id === rehearsalId ? data.data : rehearsal
                ),
            }));

            return { success: true, data: data.data, message: "Task added successfully" };
        } catch (error) {
            console.error('Error adding task to rehearsal:', error);
            return { success: false, message: error.message };
        }
    },

    deleteTask: async (rehearsalId, taskId) => {
        try {
            const res = await fetch(`/api/rehearsals/${rehearsalId}/tasks/${taskId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (!data.success) {
                return { success: false, message: data.message };
            }

            // Update the global rehearsals state with the complete updated rehearsal
            set((state) => ({
                rehearsals: state.rehearsals.map((rehearsal) => 
                    rehearsal._id === rehearsalId ? data.data : rehearsal
                ),
            }));

            return { success: true, data: data.data, message: "Task deleted successfully" };
        } catch (error) {
            console.error('Error deleting task:', error);
            return { success: false, message: error.message };
        }
    }
}));