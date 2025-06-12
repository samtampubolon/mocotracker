import React, { useState } from 'react'
import { 
    Box, 
    Grid, 
    GridItem, 
    Text, 
    useToast, 
    IconButton, 
    HStack, 
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    Input,
    FormControl,
    FormLabel,
    useDisclosure
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, DragHandleIcon } from '@chakra-ui/icons'
import { useSongStore } from '../store/song'

const SongCard = ({ song, isDragging }) => {
    const {deleteSong, updateSong} = useSongStore();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [updatedSong, setUpdatedSong] = useState({
        title: song.title,
        soloist: song.soloist,
        conductor: song.conductor,
        vp: song.vp
    });

    const handleDeleteSong = async (pid) => {
        const {success, message} = await deleteSong(pid)
        if (!success) {
            toast({
                title: "Error",
                description: message,
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } else {
            toast({
                title: "Success",
                description: message,
                status: "success",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleUpdateSong = async (id, songData) => {
        const {success, message} = await updateSong(id, songData)
        if (!success) {
            toast({
                title: "Error",
                description: message,
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } else {
            toast({
                title: "Success",
                description: message,
                status: "success",
                duration: 3000,
                isClosable: true,
            })
            onClose()
        }
    }


    return (
        <Box
            bg="white"
            p={4}
            rounded="lg"
            w="full"
            minHeight="80px"
            style={{
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                userSelect: 'none',
                backgroundColor: 'white',
                boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none',
            }}
        >

            <Flex justify="space-between" align="center">
                <Grid templateColumns="repeat(4, 1fr)" gap={4} flex="1">
                    <GridItem>
                        <Box p={3} bg="gray.100" rounded="md" height="full" minHeight="50px">
                            <Text color="black" textAlign="left">{song.title}</Text>
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box p={3} bg="gray.100" rounded="md" height="full" minHeight="50px">
                            <Text color="black" textAlign="left">{song.soloist || "N/A"}</Text>
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box p={3} bg="gray.100" rounded="md" height="full" minHeight="50px">
                            <Text color="black" textAlign="left">{song.conductor || "N/A"}</Text>
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Box p={3} bg="gray.100" rounded="md" height="full" minHeight="50px">
                            <Text color="black" textAlign="left">{song.vp || "N/A"}</Text>
                        </Box>
                    </GridItem>
                </Grid>
                <HStack spacing={2} ml={4} onClick={e => e.stopPropagation()}>
                    <IconButton icon={<EditIcon />} colorScheme="blue" onClick={onOpen} aria-label="Edit song"/>
                    <IconButton icon={<DeleteIcon />} colorScheme="red" onClick={() => handleDeleteSong(song._id)} aria-label="Delete song"/>
                </HStack>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />

				<ModalContent>
					<ModalHeader>Update Song</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4}>
							<FormControl>
								<FormLabel>Title</FormLabel>
								<Input
									value={updatedSong.title}
									onChange={(e) => setUpdatedSong({ ...updatedSong, title: e.target.value })}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Soloist</FormLabel>
								<Input
									value={updatedSong.soloist}
									onChange={(e) => setUpdatedSong({ ...updatedSong, soloist: e.target.value })}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Conductor</FormLabel>
								<Input
									value={updatedSong.conductor}
									onChange={(e) => setUpdatedSong({ ...updatedSong, conductor: e.target.value })}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>VP</FormLabel>
								<Input
									value={updatedSong.vp}
									onChange={(e) => setUpdatedSong({ ...updatedSong, vp: e.target.value })}
								/>
							</FormControl>
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button
							colorScheme='blue'
							mr={3}
							onClick={() => handleUpdateSong(song._id, updatedSong)}
						>
							Update
						</Button>
						<Button variant='ghost' onClick={onClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
        </Box>
    )
}

export default SongCard