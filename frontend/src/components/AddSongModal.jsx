import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Input,
  useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { useSongStore } from '../store/song';

const AddSongModal = ({ isOpen, onClose }) => {
  const [newSong, setNewSong] = useState({
    title: "",
    soloist: "",
    conductor: "",
    vp: "",
  });
  
  const toast = useToast();
  const { createSong } = useSongStore();

  const handleAddSong = async () => {
    const { success, message } = await createSong(newSong);
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        isClosable: true,
      });
      setNewSong({
        title: "",
        soloist: "",
        conductor: "",
        vp: "",
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Song</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Input
              placeholder="Song Title"
              value={newSong.title}
              onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
            />
            <Input
              placeholder="Soloist"
              value={newSong.soloist}
              onChange={(e) => setNewSong({ ...newSong, soloist: e.target.value })}
            />
            <Input
              placeholder="Conductor"
              value={newSong.conductor}
              onChange={(e) => setNewSong({ ...newSong, conductor: e.target.value })}
            />
            <Input
              placeholder="VP"
              value={newSong.vp}
              onChange={(e) => setNewSong({ ...newSong, vp: e.target.value })}
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleAddSong}>
            Add Song
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddSongModal;