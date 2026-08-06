// @ts-nocheck
"use client";

import SliderImport from 'react-slick';
const Slider = typeof SliderImport === 'function' ? SliderImport : (SliderImport.default || SliderImport);
import PrevArrow from '../Arrows/PrevArrow';
import NextArrow from '../Arrows/NextArrow';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Slide = (props: any) => {
  const { children, slidesToShow } = props;

  const settings = {
    infinite: true,
    slidesToShow: slidesToShow,
    slidesToScroll: slidesToShow,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 900, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  return (
    <div className='w-full py-10 lg:py-24 flex justify-center'>
      <div className="w-full container mx-auto px-4 md:px-6 relative">
        <Slider {...settings}>
          {children}
        </Slider>
      </div>
    </div>
  )
}

export default Slide;