import { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const links = [
  { name: 'Ratings', path: '/ratings' },
  { name: 'About', path: '/about' }
];

const Navigation = () => {
  const [showNav, setShowNav] = useState(false);

  // Get current path
  const path = window.location.pathname;

  return (
    <nav className='border-b-2 border-purple-200 py-2 px-5 sticky top-0 bg-purple-100'>
      
      <div className='flex flex-row justify-between'>
        <button onClick={() => setShowNav(true)} className=''>
          <MenuIcon style={{ fontSize: 36 }} />
        </button>
        <Link to='/' className=''>
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt='logo' width={64}/>
        </Link>
      </div>
      

      <div
        className={'w-full h-screen top-0 fixed left-0 backdrop-blur-sm ' + (showNav ? '' : 'hidden')} 
        onClick={() => setShowNav(false)}
      />
      <div className={
        'transform transition-all duration-500 ease-in-out fixed left-0 ' 
      + (showNav ? 'translate-x-0' : '-translate-x-full')
      + ' bg-purple-50 w-1/2 h-screen top-0'
      }>
        <div className='flex flex-row items-center'>
          <button onClick={() => setShowNav(false)} className='w-1/2'>Close</button>
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt='logo' width={64}/>
          {/* <p className='w-full text-center'>Tufts Crowds</p> */}
        </div>
        <ul>
          {links.map((link, index) => (
            <li key={index} className={
              'm-2 hover:bg-purple-100 '
            + (path === link.path ? 'bg-purple-100' : '')
            }>
              <Link to={link.path} onClick={() => setShowNav(false)} className='p-2 block w-full'>{link.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      
    </nav>
  );
}
 
export default Navigation;