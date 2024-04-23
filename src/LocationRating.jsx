import { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import QuickSubmit from './QuickSubmit';
import { db } from './config/firebase-config';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { useCollapse } from 'react-collapsed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CircularProgress from '@mui/material/CircularProgress';

function Location({ location, hour }) {
  const [ratingAverage, setRatingAverage] = useState({});
  const [status, setStatus] = useState(0); // 0: loading, 1: success, 2: none, 3: error
  const [commentStatus, setCommentStatus] = useState(0); // 0: loading, 1: success, 2: None, 3: error
  const [showPopup, setShowPopup] = useState(false);

  const [comments, setComments] = useState([]);

  const [showComments, setShowComments] = useState(false);
  const { getCollapseProps, getToggleProps } = useCollapse({ showComments });

  const ratingColors = [
    'text-purple-300',
    'text-purple-400',
    'text-purple-500',
    'text-purple-600',
    'text-purple-700'
  ]
  
  const todayFirstHour = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor(now.getTime() / (60 * 60 * 1000));
  }
  
  
  async function fetchData() {
    try {
      const queryLocation = location.databaseKey;
      const queryHour = todayFirstHour() + hour;
      const q = query(collection(db, 'averages'), where('location', '==', queryLocation), where('hour', '==', queryHour));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setStatus(2);
        setRatingAverage(0);
        return;
      }
      const data = querySnapshot.docs[0].data();
      setRatingAverage(data.total / data.submissions);
      setStatus(1);
    } catch (err) {
      console.error(err);
      setStatus(2);
    }
  }
  useEffect(() => {
    fetchData();
  }, [location, hour]);

  const getComments = async () => {
    try {
      const baseurl = 'https://us-central1-tufts-crowds.cloudfunctions.net/getComments';
      const url = new URL(baseurl);
      url.searchParams.append('location', location.databaseKey);
      url.searchParams.append('hour', todayFirstHour() + hour);

      const response = await fetch(url);
      const data = await response.json();
      const filteredData = data.filter(comment => comment.comment !== '');

      setComments(filteredData);
      if (filteredData.length === 0)
        setCommentStatus(2);
      else
        setCommentStatus(1);
    } catch (err) {
      console.error(err);
      setCommentStatus(3);
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments);
    if (commentStatus === 0)
      getComments();
  }

  return (
    <div className='text-center w-full mx-auto my-5 flex flex-col'>
      {/* Popup */}
      <div
        className={
          'fixed top-0 left-0 bg-opacity-40 bg-black w-full h-full flex flex-col justify-center items-center z-10 '
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
          <QuickSubmit location={location}
            close={() => {
              setShowPopup(false);
              getComments();
              fetchData();
            }
          } />
        </div>
      </div>
      
      {/* Main */}
      {/* Title */}
      <div
      className='rounded-t-xl bg-purple-300 py-2 relative'
        {...getToggleProps({
          onClick: toggleComments
        })}
        >
        <p className='text-center'>{ location.name }</p>
        <div className='absolute right-2 top-2'>
          {showComments ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
      </div>

      {/* Comments */}
      
      <div {...getCollapseProps()} className='border-purple-200 border-x-2 border-b-2'>
        <p className='w-fit mx-auto p-2 text-lg border-b-2 border-purple-200'>Comments</p>
        {commentStatus === 0 && <CircularProgress size={24} sx={{ color: "inherit" }} />}
        {commentStatus === 1 && <ul>
          { comments.map((comment, index) => (
            <li key={index} className='border-purple-200 border-b-2 last:border-0 flex flex-row items-center py-2 mx-5'>
              <p className={ratingColors[comment.rating - 1] + " text-3xl w-10 h-10"}>{comment.rating}</p>
              <p className='text-left  text-sm w-fit'>{comment.comment}</p>
            </li>
          ))}
        </ul>}
        {commentStatus === 2 && <p className='text-center'>No comments yet</p>}
        {commentStatus === 3 && <p className='text-center'>Error fetching data</p>}
      </div>
      
      <div className='flex flex-row border-purple-200 border-x-2 border-b-2 rounded-b-xl'>
        
        {/* Rating */}
        <div className='items-center w-1/2 py-3 border-r-2 border-purple-200'>
          { status === 0 && <CircularProgress size={24} sx={{ color: "inherit" }} /> }
          { status === 1 && 
            <div>
              <p>Crowd level: {Math.round(ratingAverage * 100) / 100}</p>
              <ul className='flex flex-row justify-center'>
                {
                  Array.from({ length: 5 }, (v, i) => i + 1).map((rating, index) => (
                    <li key={index} className={`
                      ${(index + 1) <= ratingAverage ? 'bg-purple-100' : 'bg-white'}
                      h-6 w-6
                      first:rounded-l-xl first:border-l-2
                      last:rounded-r-xl last:border-r-2
                      border-r-2 border-y-2 border-purple-200
                    `} />
                  ))
                }
              </ul>
            </div>
          }
          { status === 2 && <p>No ratings yet</p> }
          { status === 3 && <p>Error fetching data</p> }
        </div>

        {/* Submit button */}
        <div className='flex items-center justify-center w-1/2'>
          <button onClick={() => setShowPopup(true)} className='bg-purple-200 m-3 px-2 py-3 rounded-xl' 
        >Add Rating</button>
        </div>
      </div>
      
    </div>
  );
}

export default Location;
