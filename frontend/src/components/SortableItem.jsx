import React from 'react';
import { Box, IconButton } from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
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
        position="absolute"
        left="-40px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        {...attributes}
        {...listeners}
      >
        <IconButton
          icon={<DragHandleIcon />}
          variant="ghost"
          cursor={isDragging ? "grabbing" : "grab"}
          aria-label="Drag to reorder"
          _hover={{ bg: 'gray.100' }}
        />
      </Box>
      {children}
    </Box>
  );
};

export default SortableItem;
