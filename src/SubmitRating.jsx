import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { LOCATIONS } from './globals';

const SubmitRating = () => {
  const [rating, setRating] = useState(-1);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(0); // 0: Ready, 1: Loading
  const [location, setLocation] = useState(1); // Default to Carm
  const [time, setTime] = useState(new Date()); // Default to 0

  const submitRating = () => {console.log("Submitting", rating, "for", location)}; // Implement this function
  return (
    <div className='flex flex-col justify-center items-center'>
      <h1 className='font-semibold text-lg'>Submit new crowd rating</h1>
      
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
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className='w-full h-32 border-2 border-purple-200 rounded-sm'
        placeholder='Add a comment...'
      />
      <button
        disabled={rating === -1}
        onClick={() => {
          if (rating === -1 || status === 1) {
            return;
          }
          submitRating(rating, location, comment);
        }}
        className={
          'rounded-xl h-12 min-w-24 mt-5 '
          + ((rating === -1) ?  'bg-gray-200' : 'bg-purple-200')
        }
      >
        {status === 0 && "Submit"}
        {status === 1 && <CircularProgress size={24} sx={{ color: "inherit" }} />}
        {status === 2 && "Error"}
      </button>
    </div>
  );
}
 
export default SubmitRating;