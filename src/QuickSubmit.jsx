import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const QuickSubmit = ({location, close}) => {

  const [rating, setRating] = useState(-1);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(0); // 0: Ready, 1: Loading

  const submitRating = async (rating, location, comment) => {
    console.log('Quick submitting rating', rating, location, comment);
    setStatus(1);
    try {
      const response = await fetch('https://us-central1-tufts-crowds.cloudfunctions.net/updateRating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: parseInt(rating), location: location.databaseKey, comment: comment }),
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.text();
      console.log('Success:', data);
      setRating(-1);
      setComment('');
      setStatus(0);
      close();
    } catch (error) {
      console.error('Error:', error);
      setStatus(2);
    }
  };


  return (
    <div className='flex flex-col justify-center items-center'>

      <h1 className='font-semibold text-lg mb-5'>Submit rating for {location.name}</h1>
      <p>
        Rate {location.name} for the current crowd level.
      </p>
      
      {/* <p className='mt-5 w-full text-left'>Choose a rating...</p> */}
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
 
export default QuickSubmit;