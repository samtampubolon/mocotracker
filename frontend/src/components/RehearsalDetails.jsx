import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Heading,
  Divider,
  Select,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Collapse,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useSongStore } from '../store/song';
import { useRehearsalStore } from '../store/rehearsal';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import SortableTask from './SortableTask';

const RehearsalDetails = ({ isOpen, onClose, rehearsal }) => {
  const [selectedSong, setSelectedSong] = useState('');
  const [taskType, setTaskType] = useState('learn');
  const [recordingFile, setRecordingFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [localRehearsal, setLocalRehearsal] = useState(rehearsal);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const toast = useToast();
  const { songs } = useSongStore();
  const { updateRehearsal, deleteTask, addTaskToRehearsal } = useRehearsalStore();

  useEffect(() => {
    setLocalRehearsal(rehearsal);
    if (rehearsal?.notes) {
      setNotes(rehearsal.notes);
    }
  }, [rehearsal]);

  // Debounce function for notes update
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Auto-save notes when they change
  const updateNotes = async (newNotes) => {
    if (!rehearsal) return;
    
    const { success, message } = await updateRehearsal(rehearsal._id, {
      ...rehearsal,
      notes: newNotes
    });

    if (!success) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const debouncedUpdateNotes = debounce(updateNotes, 1000);

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    debouncedUpdateNotes(newNotes);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setSelectedSong(task.song._id);
    setTaskType(task.taskType);
    setRecordingFile(task.recording || '');
    setIsAddTaskOpen(true);
  };

  const handleAddTask = async () => {
    if (!selectedSong) {
      toast({
        title: "Error",
        description: "Please select a song",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    // If we're editing, first delete the existing task
    if (editingTaskId) {
      await handleDeleteTask(editingTaskId);
    }

    const formData = new FormData();
    formData.append('song', selectedSong);
    formData.append('taskType', taskType);
    formData.append('date', rehearsal?.date);
    if (recordingFile) {
      formData.append('recording', recordingFile);
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        // Add task to rehearsal and update both global and local state
        const { success: addSuccess, data: updatedRehearsal } = await addTaskToRehearsal(rehearsal._id, data.data._id);

        if (addSuccess) {
          setLocalRehearsal(updatedRehearsal);
          toast({
            title: "Success",
            description: editingTaskId ? "Task updated successfully" : "Task added successfully",
            status: "success",
            duration: 3000,
            isClosable: true
          });
          // Reset form
          setSelectedSong('');
          setTaskType('learn');
          setRecordingFile(null);
          setEditingTaskId(null);
          setIsAddTaskOpen(false);
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create task",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!rehearsal || !taskId) return;

    const { success, message, data } = await deleteTask(rehearsal._id, taskId);
    if (success) {
      // Update local state with the complete rehearsal data
      setLocalRehearsal(data);
      
      if (taskId === editingTaskId) {
        setEditingTaskId(null);
        setSelectedSong('');
        setTaskType('learn');
        setRecordingFile(null);
      }
      toast({
        title: "Success",
        description: "Task deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } else {
      toast({
        title: "Error",
        description: message || "Failed to delete task",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || !rehearsal || !localRehearsal) return;

    const oldIndex = localRehearsal.tasks.findIndex(task => task._id === active.id);
    const newIndex = localRehearsal.tasks.findIndex(task => task._id === over.id);

    if (oldIndex === newIndex) return;

    const newTasks = arrayMove(localRehearsal.tasks, oldIndex, newIndex);
    
    // Optimistic update
    setLocalRehearsal(prev => ({
      ...prev,
      tasks: newTasks
    }));

    try {
      const response = await fetch(`/api/rehearsals/${rehearsal._id}/tasks/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: newTasks }),
      });

      const data = await response.json();
      
      if (!data.success) {
        // Revert on failure
        setLocalRehearsal(prev => ({
          ...prev,
          tasks: rehearsal.tasks
        }));
        
        toast({
          title: "Error",
          description: "Failed to reorder tasks",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      // Revert on error
      setLocalRehearsal(prev => ({
        ...prev,
        tasks: rehearsal.tasks
      }));
      
      toast({
        title: "Error",
        description: "Failed to reorder tasks",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formattedDate = localRehearsal?.date ? new Date(localRehearsal.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontSize="xl" fontWeight="bold">{formattedDate}</Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb={4}>Tasks</Heading>
              {localRehearsal?.tasks?.length > 0 ? (
                <DndContext
                  onDragEnd={handleDragEnd}
                  collisionDetection={closestCenter}
                >
                  <SortableContext items={localRehearsal.tasks.map(task => task._id)}>
                    <VStack spacing={2} align="stretch">
                      {localRehearsal.tasks.map((task) => (
                        <SortableTask
                          key={task._id}
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </VStack>
                  </SortableContext>
                </DndContext>
              ) : (
                <Text color="gray.500">No tasks added yet</Text>
              )}
            </Box>

            <Divider />
            
            <Box>
              <HStack justify="space-between" mb={4}>
                <Heading size="sm">
                  {editingTaskId ? 'Edit Task' : 'Add New Task'}
                </Heading>
                <IconButton
                  icon={isAddTaskOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  variant="ghost"
                  onClick={() => {
                    if (!isAddTaskOpen) {
                      setEditingTaskId(null);
                      setSelectedSong('');
                      setTaskType('learn');
                      setRecordingFile(null);
                    }
                    setIsAddTaskOpen(!isAddTaskOpen);
                  }}
                  aria-label={isAddTaskOpen ? "Collapse task form" : "Expand task form"}
                />
              </HStack>
              
              <Collapse in={isAddTaskOpen} animateOpacity>
                <VStack spacing={3}>
                  <FormControl>
                    <FormLabel>Song</FormLabel>
                    <Select
                      value={selectedSong}
                      onChange={(e) => setSelectedSong(e.target.value)}
                      placeholder="Select a song"
                    >
                      {songs.map(song => (
                        <option key={song._id} value={song._id}>
                          {song.title}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Task Type</FormLabel>
                    <Select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                    >
                      <option value="learn">Learn</option>
                      <option value="run on-book">Run On-Book</option>
                      <option value="run off-book">Run Off-Book</option>
                      <option value="workshop">Workshop</option>
                      <option value="sectionals">Sectionals</option>
                      <option value="auditions">Auditions</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Recording File</FormLabel>
                    <Input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => setRecordingFile(e.target.files[0])}
                      p={1}
                    />
                  </FormControl>

                  <Button 
                    colorScheme="blue" 
                    onClick={handleAddTask} 
                    alignSelf="flex-end"
                  >
                    {editingTaskId ? 'Update Task' : 'Add Task'}
                  </Button>
                </VStack>
              </Collapse>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add any notes about this rehearsal"
                  rows={4}
                />
              </FormControl>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RehearsalDetails;