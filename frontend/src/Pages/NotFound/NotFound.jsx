import image1 from '../../assets/Notfound.jpg'
import { useEffect } from 'react';

export default function NotFound() {
   useEffect(() => {
    document.title = "Not found";
  }, []);


  return (
    <div className='flex items-center justify-center'>
        <img src={image1}/>
    </div>
  )
}

