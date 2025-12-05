import author1 from './../../assets/Stephen King.jpg'
import author2 from './../../assets/J. K. Rowling.webp'
import author3 from './../../assets/George Orwell.jpg'
import author4 from './../../assets/Yu Hua.png'
import author5 from './../../assets/MoYan_Hamburg_2008.jpg'
import author6 from './../../assets/Doris Lessing.jpg'
import author7 from './../../assets/Anita Desai.jpg'
import author8 from './../../assets/Sinclair Lewis.jpg'
import author9 from './../../assets/Joseph Conrad.png'
import author10 from './../../assets/Haruki Murakami.jpg'
import author11 from './../../assets/Gabriel García Márquez.jpg'
import author12 from './../../assets/Toni Morrison.jpg'
import author13 from './../../assets/Charles Dickens.jpg'
import author14 from './../../assets/Ernest Hemingway.webp'
import author15 from './../../assets/Fyodor Dostoevsky.jpg'
import author16 from './../../assets/Mark Twain.jpg'
import author17 from './../../assets/Virginia Woolf.jpg'
import author18 from './../../assets/F. Scott Fitzgerald.jpg'
import Slider from 'react-slick'
import { Link } from 'react-router-dom'

export default function AuthSlider() {

const authors = [
  { name: "Stephen King", img: author1 },
  { name: "J. K. Rowling", img: author2 },
  { name: "George Orwell", img: author3 },
  { name: "Yu Hua", img: author4 },
  { name: "MoYan Hamburg", img: author5 },
  { name: "Doris Lessing", img: author6 },
  { name: "Anita Desai", img: author7 },
  { name: "Sinclair Lewis", img: author8 },
  { name: "Joseph Conrad", img: author9 },
  { name: "Haruki Murakami", img: author10 },
  { name: "Gabriel García Márquez", img: author11 },
  { name: "Toni Morrison", img: author12 },
  { name: "Charles Dickens", img: author13 },
  { name: "Ernest Hemingway", img: author14 },
  { name: "Fyodor Dostoevsky", img: author15 },
  { name: "Mark Twain", img: author16 },
  { name: "Virginia Woolf", img: author17 },
  { name: "F. Scott Fitzgerald", img: author18 }
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
     <div className='my-9 mx-9'>
      <Link to="/authors">
      <Slider {...settings}>
      {authors.map((author , index)=> (
       <div className='p-4' key={index}>
          <img src={author.img} className='w-full h-[300px]' alt={author.name}/>
          <h5 className='m-3 font-semibold text-main'>{author.name}</h5>
       </div>
      ))}
    </Slider>
      </Link>
    </div>
  )
}
