import React from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { mainCarouselData } from "./MainCarouselData.js";

const MainCarousel = () => {
  // Create carousel items based on the data
  const items = mainCarouselData.map((image, index) => (
    <div key={index} className="carousel-item" style={{ width: "100%" }}>
      <img
        src={image.src}
        alt={image.alt}
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  ));

  return (
    <AliceCarousel
      items={items}
      disableButtonsControls
      autoPlay
      autoPlayInterval={2000} // Interval between slides (3 seconds)
      infinite
      animationType="fadeout" // Set the animation type to 'fadeout'
      animationDuration={3000} // Set a higher duration (e.g., 1000 ms) for slower fade effect
      mouseTracking // Enable mouse tracking for user interaction
      responsive={{
        1024: { items: 1 }, // Custom settings for different breakpoints
        768: { items: 1 },
        480: { items: 1 },
      }}
    />
  );
};

export default MainCarousel;
