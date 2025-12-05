import React from 'react'
import Slider from 'react-slick';
import book1 from './../../assets/The Catcher in the Rye.jpg'
import book2 from './../../assets/The Lord of the Rings.jpg'
import book3 from './../../assets/Crime and Punishment.jpg'
import book4 from './../../assets/Animal Farm.jpg'
import book5 from './../../assets/Jane Eyre.jpg'
import book6 from './../../assets/Wuthering Heights.jpg'
import book7 from './../../assets/The Count of Monte Cristo.jpg'
import book8 from './../../assets/The Alchemist.jpg'
import book9 from './../../assets/The Grapes of Wrath.jpg'
import book10 from './../../assets/Ulysses.jpg'
import book11 from './../../assets/Great Expectations.jpg'
import book12 from './../../assets/Lolita.jpg'
import book13 from './../../assets/The Road Not Taken.jpg'
import book14 from './../../assets/The Brothers Karamazov.jpg'
import book15 from './../../assets/Lord of the Flies.jpg'
import { Link } from 'react-router-dom'

export default function MainSlider() {
    
    const books = [
{ name: "The Catcher in the Rye", img: book1 },
{ name: "The Lord of the Rings", img: book2 },
{ name: "Crime and Punishment", img: book3 },
{ name: "Animal Farm", img: book4 },
{ name: "Jane Eyre", img: book5 },
{ name: "Wuthering Heights", img: book6 },
{ name: "The Count of Monte Cristo", img: book7 },
{ name: "The Alchemist", img: book8 },
{ name: "The Grapes of Wrath", img: book9 },
{ name: "Ulysses", img: book10 },
{ name: "Great Expectations", img: book11 },
{ name: "Lolita", img: book12 },
{ name: "The Road Not Taken", img: book13 },
{ name: "The Brothers Karamazov", img: book14 },
{ name: "Lord of the Flies", img: book15 }
];

    const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 7,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 1000,
  responsive: [
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 2,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};
  return (
    <div id="main-slider" className='my-9 mx-9'>
  <Link to={"/books"}>
  <Slider {...settings}>
    {books.map((book , index)=> (
      <div className='p-4' key={index}>
        <img src={book.img} className='w-full h-[300px]' alt={book.name}/>
        <h5 className='m-3 font-semibold text-main'>{book.name}</h5>
      </div>
    ))}
  </Slider>
  </Link> 
</div>
  )
}
