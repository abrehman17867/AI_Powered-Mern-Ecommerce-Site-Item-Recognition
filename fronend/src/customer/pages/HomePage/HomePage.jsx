import React, { useState, useEffect } from "react";
import MainCarousel from "../../components/HomeCarousel/MainCarousel.jsx";
import HomeSectionCard from "../../components/HomeSectionCard/HomeSectionCard.jsx";
import Spinner from "../../components/Spinner/Spinner"; 
import { Hero } from "../../components/Home/Hero.jsx";
import { api } from "../../../config/apiConfig.jsx";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
 

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await api.get("/api/products");
      setProducts(response.data.content);
    };

    fetchProducts();
  }, []);

  // console.log("Home products : ", products);

  

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <div>
          <MainCarousel />
          <div className="space-y-10 py-20 flex-col justify-center px-5 lg:px-10">
            <Hero />
            <HomeSectionCard data={products} sectionName={"Featured Products"} />
          
          </div>
        </div>
      )}
    </div>
  );
}
