import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { LOCATIONS } from './globals';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const dateToHours = (date) => {
  const milliseconds = date.getTime();
  return Math.floor(milliseconds / (60 * 60 * 1000));
}

const SubmitRating = () => {

  const [rating, setRating] = useState(-1);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(0); // 0: Ready, 1: Loading, 2: Error, 3: Success
  const [location, setLocation] = useState(1); // Default to Carm
  const [time, setTime] = useState(new Date(dateToHours(new Date()) * 60 * 60 * 1000)); // Default to 0

  const submitRating = async (rating, location, comment, hour) => {
    console.log('Quick submitting rating', rating, location, comment, hour);
    setStatus(1);
    try {
      const response = await fetch('https://us-central1-tufts-crowds.cloudfunctions.net/updateRating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: parseInt(rating), location: location, comment: comment, hour: hour }),
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.text();
      console.log('Success:', data);
      setRating(-1);
      setComment('');
      setStatus(3);

      setTimeout(() => {
        setStatus(0);
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
      setStatus(2);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center'>
      
      {/* Success message */}
      {status === 3 && (
        <div className='bg-green-200 border-2 border-green-400 rounded-xl p-2 w-2/3 my-5 text-center'>
          Rating submitted successfully!
        </div>
      )}

      {/* Error message */}
      {status === 2 && (
        <div className='bg-red-200 border-2 border-red-400 rounded-xl p-2 w-2/3 my-5 text-center'>
          Error submitting rating. Please try again later.
        </div>
      )}

      {/* Title */}
      <h1 className='font-semibold text-lg'>Submit new crowd rating</h1>
      
      {/* Location select */}
      <div className='flex items-center flex-col'>
        <p className='mt-5 w-full text-center'>Select a location</p>
        <select
          value={LOCATIONS.find((loc) => loc.databaseKey === location.databaseKey)}
          onChange={(e) => setLocation(e.target.value)}
          className='w-1/2 h-12 border-2 border-purple-200 rounded-xl'
        >
          {
            LOCATIONS.map((location, index) => (
              <option key={index} value={index}>{location.name}</option>
            ))
          }
        </select>
      </div>

      {/* Time select */}
      <div className=''>
        <p className='mt-5 w-full text-center'>Select a time</p>
        <DatePicker
          selected={time}
          onChange={(date) => setTime(date)}
          showTimeSelect
          timeIntervals={60}
          timeCaption="Time"
          dateFormat="h:mm aa"
          className='border-2 border-purple-200 rounded-xl w-1/2 p-2 block mx-auto'
        />
      </div>

      {/* Rating select */}
      <div>
        <p className='mt-5 w-full text-center'>Choose a rating</p>
        <div className='flex flex-row my-2 mb-5'>
          {
            Array.from({length: 5}, (_, i) => (
              <button
                key={i}
                onClick={() => setRating(i + 1)}
                className={'border-2 border-purple-200 rounded-xl w-12 h-8 mx-1' + (rating === i + 1 ? ' bg-purple-200' : '')}
              >{i + 1}</button>
            ))
          }
        </div>
      </div>
      
      {/* Comment */}
      <div className='w-full'>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className='w-full h-32 border-2 border-purple-200 rounded-sm'
          placeholder='Add a comment...'
        />
      </div>

      {/* Submit button */}
      <button
        disabled={rating === -1}
        onClick={() => {
          if (rating === -1 || status === 1) {
            return;
          }
          submitRating(rating, location, comment, dateToHours(time));
        }}
        className={
          'rounded-xl h-12 min-w-24 mt-5 '
          + ((rating === -1) ?  'bg-gray-200' : 'bg-purple-200')
        }
      >
        {(status === 0 || status === 3) && "Submit"}
        {status === 1 && <CircularProgress size={24} sx={{ color: "inherit" }} />}
        {status === 2 && "Error"}
      </button>
    </div>
  );
}
 
export default SubmitRating;