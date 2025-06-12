import { Container, Flex, Text, HStack } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <Container maxW={"1140px"} px={4}>
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{
          base: "column",
          sm: "row"
        }}
      >
        <Text
          fontSize={{ base: "22", sm: "28" }}
          fontWeight={"bold"}
          textAlign={"center"}
          bgGradient={"linear(to-r, cyan.400, blue.500)"}
          bgClip={"text"}
        >
          <Link to={"/"}>Moco Tracker</Link>
        </Text>
        
        <HStack spacing={8} mt={{ base: 4, sm: 0 }}>
          <Link 
            to="/"
            style={{
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Songs
          </Link>
          <Link 
            to="/rehearsal"
            style={{
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Rehearsals
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;