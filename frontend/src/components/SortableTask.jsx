import React from 'react';
import { Box, IconButton, Text, HStack, Flex, Link } from '@chakra-ui/react';
import { DeleteIcon, AttachmentIcon, DragHandleIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableTask = ({ task, onEdit, onDelete }) => {
  // Add safety check for task and task.song
  if (!task || !task.song) {
    return null;
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    width: '100%',
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      position="relative"
      width="100%"
    >
      <Box
        p={3}
        bg="gray.50"
        borderRadius="md"
        cursor="pointer"
        onClick={() => onEdit(task)}
        _hover={{ bg: 'gray.100' }}
        style={{
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <Flex justify="space-between" align="center">
          <Box flex="1">
            <Text fontWeight="bold">{task.song.title}</Text>
            <Text fontSize="sm" color="gray.600">
              {task.taskType}
            </Text>
            {task.recording && (
              <Link 
                fontSize="sm" 
                color="blue.600" 
                href={task.recording} 
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                <HStack spacing={1}>
                  <AttachmentIcon />
                  <Text>Download Recording</Text>
                </HStack>
              </Link>
            )}
          </Box>
          <HStack spacing={2}>
            <IconButton
              icon={<DragHandleIcon />}
              variant="ghost"
              cursor={isDragging ? "grabbing" : "grab"}
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              _hover={{ bg: 'gray.200' }}
            />
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              aria-label="Delete task"
            />
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default SortableTask;