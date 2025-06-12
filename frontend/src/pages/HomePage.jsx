import { VStack, Container, Text, Grid, GridItem, useToast, IconButton, useDisclosure, Heading } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSongStore } from '../store/song';
import SongCard from '../components/SongCard';
import SortableItem from '../components/SortableItem';
import AddSongModal from '../components/AddSongModal';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Homepage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { fetchSongs, songs, reorderSongs } = useSongStore();
  const toast = useToast();
  
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;

    const oldIndex = songs.findIndex(song => song._id === active.id);
    const newIndex = songs.findIndex(song => song._id === over.id);

    const items = arrayMove(songs, oldIndex, newIndex);

    // Optimistic update
    useSongStore.setState({ songs: items });

    const { success, message } = await reorderSongs(items);
    if (!success) {
      // Revert on failure
      useSongStore.setState({ songs });
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW='container.xl' py={12}>
      <VStack spacing={8}>
        <Heading mb={6} textAlign="center">Song List</Heading>
        <VStack spacing={4} alignItems='center' w="full">
          {songs.length > 0 ? (
            <>
              <Grid templateColumns="repeat(4, 1fr)" gap={4} w="full" px={4}>
                <GridItem>
                  <Text fontWeight="bold" color="gray.600">Title</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold" color="gray.600">Soloist</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold" color="gray.600">Conductor</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold" color="gray.600">VP</Text>
                </GridItem>
              </Grid>
              <DndContext
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
              >
                <SortableContext items={songs.map(song => song._id)}>
                  <VStack
                    spacing={4}
                    w="full"
                    style={{
                      minHeight: '100px',
                      transition: 'background-color 0.2s ease',
                      padding: '8px',
                      borderRadius: '8px'
                    }}
                  >
                    {songs.map((song, index) => (
                      <SortableItem key={song._id} id={song._id}>
                        <SongCard 
                          song={song} 
                          isDragging={false} 
                        />
                      </SortableItem>
                    ))}
                  </VStack>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            <VStack spacing={4}>
              <Text fontSize='xl' textAlign="center" fontWeight='bold' color='gray.500'>
                No songs found 😢
              </Text>
              <IconButton
                icon={<AddIcon />}
                colorScheme="blue"
                rounded="full"
                size="lg"
                onClick={onOpen}
                aria-label="Add new song"
              />
            </VStack>
          )}
          
          {songs.length > 0 && (
            <IconButton
              icon={<AddIcon />}
              colorScheme="blue"
              rounded="full"
              size="lg"
              onClick={onOpen}
              aria-label="Add new song"
              mt={4}
            />
          )}
        </VStack>
      </VStack>

      <AddSongModal isOpen={isOpen} onClose={onClose} />
    </Container>
  );
};

export default Homepage;