import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Heading
} from '@chakra-ui/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';
import { useRehearsalStore } from '../store/rehearsal';
import { useSongStore } from '../store/song';
import RehearsalDetails from '../components/RehearsalDetails';

const RehearsalPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { rehearsals, createRehearsal, fetchRehearsals } = useRehearsalStore();
  const { fetchSongs } = useSongStore();
  const [selectedRehearsal, setSelectedRehearsal] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Refresh rehearsals when modal is closed
  const handleModalClose = () => {
    setIsViewOpen(false);
    fetchRehearsals(); // Refresh rehearsals to update calendar view
  };

  useEffect(() => {
    fetchRehearsals();
    fetchSongs();
  }, [fetchRehearsals, fetchSongs]);

  // Helper function to normalize dates for comparison
  const normalizeDate = (date) => {
    const d = new Date(date);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).getTime();
  };

  const handleDateClick = async (date) => {
    const normalizedClickedDate = normalizeDate(date);
    
    const rehearsalsForDate = rehearsals.filter(rehearsal => 
      normalizeDate(rehearsal.date) === normalizedClickedDate
    );

    setSelectedDate(date);

    if (rehearsalsForDate.length > 0) {
      setSelectedRehearsal(rehearsalsForDate[0]);
      setIsViewOpen(true);
    } else {
      // Create a new rehearsal automatically when clicking on an empty date
      const newRehearsal = {
        date: date,
        tasks: []
      };
      
      const { success, data } = await createRehearsal(newRehearsal);
      if (success && data) {
        setSelectedRehearsal(data);
        setIsViewOpen(true);
      }
    }
  };

  const tileClassName = ({ date }) => {
    const normalizedDate = normalizeDate(date);
    const rehearsalsForDate = rehearsals.filter(rehearsal => 
      normalizeDate(rehearsal.date) === normalizedDate
    );
    
    // Only return has-tasks class if there are tasks
    if (rehearsalsForDate.length > 0 && rehearsalsForDate[0].tasks?.length > 0) {
      return 'has-tasks';
    }
    return '';
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6} textAlign="center">Rehearsal Tracker</Heading>
      <Calendar
        onChange={handleDateClick}
        value={selectedDate}
        className="react-calendar"
        locale="en-US"
        showWeekNumbers={false}
        minDetail="month"
        next2Label={null}
        prev2Label={null}
        showNeighboringMonth={true}
        tileClassName={tileClassName}
        formatShortWeekday={(locale, date) => 
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
        }
      />

      <RehearsalDetails 
        isOpen={isViewOpen}
        onClose={handleModalClose}
        rehearsal={selectedRehearsal}
      />
    </Container>
  );
};

export default RehearsalPage;