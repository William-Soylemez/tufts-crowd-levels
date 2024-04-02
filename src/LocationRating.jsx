import { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import QuickSubmit from './QuickSubmit';

function Location({ location, hour }) {
  const [ratingAverages, setRatingAverages] = useState({});

  const [status, setStatus] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  
  const todayFirstHour = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor(now.getTime() / (60 * 60 * 1000));
  }
  
  
  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams();
        params.append('location', location.databaseKey);
        params.append('hour', todayFirstHour());
        const response = await fetch(`https://us-central1-tufts-crowds.cloudfunctions.net/getRatingAverages?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          if (!response.ok) {
            setStatus(2);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          setStatus(1);
          return response;
        });

        const data = await response.json();
        setRatingAverages(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [location]);  

  return (
    <div className='text-center w-full mx-auto my-5 flex flex-col'>
      
      <div
        className={
          'fixed top-0 left-0 bg-opacity-40 bg-black w-full h-full flex flex-col justify-center items-center '
          + (showPopup ? 'visible' : 'invisible')
        }
        onClick={() => setShowPopup(false)}
      >
        <div
          className='w-4/5 bg-white m-10 rounded-3xl px-5 pt-12 pb-5 border-purple-200 border-2 -translate-y-36'
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className='absolute top-0 left-0 bg-purple-200 p-1 rounded-xl translate-x-2 translate-y-2'
            onClick={() => setShowPopup(false)}
          >
            <CloseIcon />
          </button>
          <QuickSubmit location={location} close={() => setShowPopup(false)} />
        </div>
      </div>

      <p className='text-center rounded-t-xl bg-purple-300 py-2'>{ location.name }</p>

      <div className='flex flex-row border-purple-200 border-x-2 border-b-2 rounded-b-xl'>
        <div className='items-center w-1/2 py-3 border-r-2 border-purple-200'>
          { status === 0 &&
            <p>Loading...</p>
          }
          { status === 1 &&
            <div>
              <p>Crowd level: {Math.round(ratingAverages[todayFirstHour() + hour] * 100) / 100}</p>
              <ul className='flex flex-row justify-center'>
                {
                  Array.from({ length: 5 }, (v, i) => i + 1).map((rating, index) => (
                    <li key={index} className={`
                      ${(index + 1) <= ratingAverages[todayFirstHour() + hour] ? 'bg-purple-100' : 'bg-white'}
                      w-6 h-6
                      first:rounded-l-xl first:border-l-2
                      last:rounded-r-xl last:border-r-2
                      border-r-2 border-y-2 border-purple-200
                    `} />
                  ))
                }
              </ul>
            </div>
          }
          { status === 2 &&
            <p>Error fetching data</p>
          }
        </div>
        <div className='flex items-center justify-center w-1/2'>
          <button onClick={() => setShowPopup(true)} className='bg-purple-200 m-3 px-2 py-3 rounded-xl' 
        >Add Rating</button>
        </div>
      </div>
    </div>
  );
}

export default Location;
