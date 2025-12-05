import React, { useEffect } from 'react'
import Header from '../../Components/Header/Header'
import MainSlider from '../../Components/MainSlider/MainSlider'
import AuthSlider from '../../Components/AuthSlider/AuthSlider';

export default function Home() {
    useEffect(() => {
        document.title = "Home";
      }, []);
  return (
    <>
    <Header/>
    <MainSlider/>
    <AuthSlider/>
    </>
  )
}


