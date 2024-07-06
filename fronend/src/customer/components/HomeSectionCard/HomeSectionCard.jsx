import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import "./HomeSectionCard.css"


export default function HomeSectionCard({ data, sectionName }) {
  const navigate=useNavigate()
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
 

  const handleClick = () => {
    navigate("/products");
  };


  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    beforeChange: (current, next) => {
      setShowLeftArrow(next !== 0);
      setShowRightArrow(next + settings.slidesToShow < data.length);
    },
  };

  const CustomPrevArrow = (props) => (
    <button
      className={`absolute left-0 top-1/2 transform -translate-y-1/2 ${
        props.className
      } ${props.hidden ? "invisible" : ""}`}
      onClick={props.onClick}
      aria-label="Previous"
      style={{
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "-18px",
        transition: "transform 0.2s",
        visibility: showLeftArrow ? "visible" : "hidden",
      }}
    >
      <div
        className="hover-effect"
        style={{
          fontSize: "26px",
          color: "black",
        }}
      >
        <FaAngleLeft />
      </div>
    </button>
  );

  const CustomNextArrow = (props) => (
    <button
      className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${
        props.className
      } ${props.hidden ? "invisible" : ""}`}
      onClick={props.onClick}
      aria-label="Next"
      style={{
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "-18px",
        transition: "transform 0.2s",
        visibility: showRightArrow ? "visible" : "hidden",
      }}
    >
      <div
        className="hover-effect"
        style={{
          
          fontSize: "26px",
          color: "black",
        }}
      >
        <FaAngleRight />
      </div>
    </button>
  );

  const goToNext = () => {
    sliderRef.current.slickNext();
  };

  const goToPrev = () => {
    sliderRef.current.slickPrev();
  };

  return (
    <div className="p-4 border rounded-2xl ">
      <h2 className="text-2xl font-bold mb-4 px-4">{sectionName}</h2>
      <div className="slider-container py-4 relative">
        <Slider {...settings} ref={sliderRef}>
          {data?.map((item, index) => (
            <div key={index} className="p-2 h-full">
              <div 
              onClick={()=>navigate(`/product/${item?._id}`)}
              className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
                <img
                  className="w-full h-40 object-cover rounded-lg mb-2 cursor-pointer"
                  src={item.imageUrl}
                  alt="not found"
                />
                <div className="flex-grow">
                  <p className="font-semibold">{item.brand}</p>
                  <p className="text-sm overflow-hidden h-16 py-1">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
        <CustomPrevArrow onClick={goToPrev} />
        <CustomNextArrow onClick={goToNext} />
      </div>
    </div>
  );
}
