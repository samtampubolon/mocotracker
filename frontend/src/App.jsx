import { Box } from "@chakra-ui/react"
import {Route, Routes} from "react-router-dom"
import HomePage from "./pages/HomePage"
import RehearsalPage from "./pages/RehearsalPage"
import Navbar from "./components/Navbar"

function App() {
  return (
    <Box minH={"100vh"} bg="gray.100">
      <Navbar/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rehearsal" element={<RehearsalPage />} />
      </Routes>
    </Box>
  )
}

export default App