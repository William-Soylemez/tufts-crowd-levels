import { useState } from 'react';
import { LOCATIONS } from './globals';
import LocationRating from './LocationRating';

const ViewRatings = () => {

  const [hour, setHour] = useState((new Date()).getHours());
  const [filter, setFilter] = useState('all');

  function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return hour + period;
  }

  return (
    <div>
      <h1 className='text-center mb-10 pb-2 border-b-2 border-purple-200 w-1/2 mx-auto text-lg'>View Ratings</h1>
      <div className='flex flex-row justify-between mx-10 mb-5 items-center'>
        {/* <button
          onClick={() => setHour((hour + 23) % 24)}
          className='text-lg border-2 border-purple-200 rounded-xl w-12 h-8'
        >-</button>
        <p>{formatHour(hour)}</p>
        <button
          onClick={() => setHour((hour + 25) % 24)}
          className='text-lg border-2 border-purple-200 rounded-xl w-12 h-8'
        >+</button> */}
        <select onChange={(e) => setHour(parseInt(e.target.value))} value={hour} className='border-2 border-purple-200 rounded-xl p-2'>
          {
            Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{formatHour(i)}</option>
            ))
          }
        </select>
        <button className='p-2 bg-purple-200 rounded-xl' onClick={() => setHour((new Date()).getHours())}>Reset time</button>
      </div>
      <div className='m-auto w-fit'>
        <span className='mx-2'>Category:</span>
        <select className='border-2 border-purple-200 rounded-xl p-2' onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value='all'>All</option>
          <option value='study'>Study</option>
          <option value='dining'>Dining</option>
          <option value='other'>Other</option>
        </select>
      </div>
      {
        LOCATIONS
          .filter((location) => (filter === 'all' || location.category === filter))
          .map((location, index) => (
            <LocationRating key={index} location={location} hour={hour} />
          ))
      }
    </div>
  );
}
 
export default ViewRatings;