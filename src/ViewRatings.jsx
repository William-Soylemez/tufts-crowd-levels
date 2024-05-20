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
      {/* Title */}
      <div className='mb-5'>
        <h1 className='text-center pb-1 border-b-2 border-purple-200 w-2/3 mb-2 mx-auto text-lg'>How busy is Tufts?</h1>
        <p className='mx-auto w-fit'>{new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())}</p>
      </div>

      {/* Time selector */}
      <div className='flex flex-row justify-center mx-5 mb-2 items-center'>

        {/* Old interface */}
        {/* <button
          onClick={() => setHour((hour + 23) % 24)}
          className='text-lg border-2 border-purple-200 rounded-xl w-12 h-8'
        >-</button>
        <p>{formatHour(hour)}</p>
        <button
          onClick={() => setHour((hour + 25) % 24)}
          className='text-lg border-2 border-purple-200 rounded-xl w-12 h-8'
        >+</button> */} 

        {/* New interface (dropdown) */}
        {/* <button
          onClick={() => setHour((hour + 23) % 24)}
          className='text-lg border-2 border-purple-200 rounded-xl w-10 h-10'
        >-</button> */}
        <select onChange={(e) => setHour(parseInt(e.target.value))} value={hour} className='border-2 border-purple-200 rounded-xl p-2 mx-5 my-2'>
          {
            Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{formatHour(i)}</option>
            ))
          }
        </select>
        <button className='p-2 bg-purple-200 rounded-xl' onClick={() => setHour((new Date()).getHours())}>Now</button>
        {/* <button
          onClick={() => setHour((hour + 25) % 24)}
          className='text-lg border-2 border-purple-200 rounded-xl w-10 h-10'
        >+</button> */}
      </div>

      {/* Category selector */}
      <div className='m-auto w-fit'>
        <span className='mx-2'>Category:</span>
        <select className='border-2 border-purple-200 rounded-xl p-2' onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value='all'>All</option>
          <option value='study'>Study</option>
          <option value='dining'>Dining</option>
          <option value='other'>Other</option>
        </select>
      </div>

      {/* Ratings */}
      <div className='flex flex-wrap justify-center'>

        {
          LOCATIONS
            .filter((location) => (filter === 'all' || location.category === filter))
            .map((location, index) => (
              <div className='w-full md:w-1/2 lg:w-1/3 p-4' key={index}>
                <LocationRating location={location} hour={hour} />
              </div>
            ))
        }
      </div>
    </div>
  );
}
 
export default ViewRatings;