import React from 'react'
import bgimg from './../../assets/bg.webp'
import './../Header/Header.css'

export default function Header() {
  return (
        <div className="relative w-full h-screen">
 <img
     src={bgimg}
     alt="Background"
     className="absolute w-full h-full object-cover"
   />


  <div className="absolute w-full h-full bg-black/50"></div>

  <div className="absolute w-full h-full flex flex-col justify-center items-center text-center px-4">
    <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold animate-fade-in-up">
      Welcome to Alex Library
    </h1>
    <p className="mt-4 text-white text-lg sm:text-xl md:text-2xl animate-fade-in-up delay-500">
      Explore amazing content
    </p>
    <button
  onClick={() => {
    const slider = document.getElementById('main-slider');
    slider.scrollIntoView({ behavior: 'smooth' });
  }}
  className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition animate-fade-in-up delay-1000"
>
  Get Started
</button>
  </div>
</div>
  )
}
