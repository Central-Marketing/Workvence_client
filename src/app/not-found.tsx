"use client";

import './NotFound.scss';

const NotFound = () => {
  return (
    <div className='not-found-container'>
      <img src="/404Img.png" alt="404 Not Found" className="not-found-image" />
      <h1>Oops! Page Not Found</h1>
      <p>The page you are looking for doesn't exist<br/>or has been moved.</p>
    </div>
  )
}

export default NotFound;