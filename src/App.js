import React from 'react';
import ViewRatings from './ViewRatings';
import About from './About';
import Navigation from './Navigation';
import SubmitRating from './SubmitRating';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {

  return (
    <Router>
      <Navigation />
      <div className='p-5 bg-purple-50 min-h-screen'>
        <div className='p-5 bg-white rounded-3xl border-2 border-purple-200'>
          <Routes>
            {/* <Route path="/" element={<Navigate replace to="/ratings" />} /> */}
            <Route path="/ratings" element={<ViewRatings />} />
            <Route path="/submit" element={<SubmitRating />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate replace to="/ratings" />} />
          </Routes>
        </div>
      </div>
    </Router>
    // <div className='p-48'>
    //   <p>aaa</p>
    //   <h1 className='fixed top-0 left-0'> Hello World </h1>
    // </div>
  );
}

export default App;
