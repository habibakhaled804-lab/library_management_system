import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../Components/Navbar/Navbar'
import Footer from '../../Components/Footer/Footer'

export default function MainLayout() {
  return (
   <div className='flex flex-col justify-between min-h-screen'>
    <Navbar/>
    <div className="container p-4 mx-auto">
        <Outlet/>
    </div>
    <Footer/>
</div>
  )
}

