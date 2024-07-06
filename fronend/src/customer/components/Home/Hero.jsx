import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../config/apiConfig";

export const Hero = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await api.get("/api/products");
      setProducts(response.data.content);
    };

    fetchProducts();
  }, []);

  console.log("Hero products : ", products);

  const handleClick = () => {
    navigate("/products");
  };

  return (
    <div className="">
      <section className="relative py-12 bg-white sm:py-16 lg:py-20">
        <div className="absolute inset-0">
          <img
            className="object-cover w-full h-full"
            src="https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/5/grid-pattern.png"
            alt=""
          />
        </div>

        <div className="relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Discover Your Perfect Product
            </h1>
            <p className="max-w-md mx-auto mt-6 text-base font-normal leading-7 text-gray-500">
              Explore our collection of products to find exactly what you need.
            </p>

            <form className="max-w-md mx-auto mt-8 space-y-4 sm:space-x-4 sm:flex sm:space-y-0 sm:items-end">
              <div className="flex-1">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="block w-full px-4 py-3 sm:py-3.5 text-base font-medium text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg sm:text-sm focus:ring-gray-900 focus:border-gray-900"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"></div>
                <button
                  onClick={handleClick}
                  className="inline-flex relative items-center justify-center w-full sm:w-auto px-8 py-3 sm:text-sm text-base sm:py-3.5 font-semibold text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                  Explore Products
                </button>
              </div>
            </form>

            <ul className="flex items-center justify-center mt-6 space-x-6 sm:space-x-8">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-xs font-medium text-gray-900 sm:text-sm">
                  Weekly New Arrivals
                </span>
              </li>

              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-xs font-medium text-gray-900 sm:text-sm">
                  Join 1600+ Happy Shoppers
                </span>
              </li>
            </ul>
          </div>
        </div>
        {/* Product section */}
        <div className="flex w-full gap-6 pb-8 mt-12 overflow-x-auto sm:mt-16 lg:mt-20 snap-x">
          {products?.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/product/${product?._id}`)}
              className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6 cursor-pointer"
            >
              <div className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
                <div className="px-4 py-5 sm:p-5">
                  <div className="flex items-start lg:items-center">
                    <div className="shrink-0">
                      <img
                        className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover"
                        src={product.imageUrl}
                        alt={product.title}
                      />
                    </div>

                    <div className="flex-1 ml-4 lg:ml-6">
                      <p className="text-xs font-medium text-gray-900 lg:text-sm">
                        {product.brand}
                      </p>
                      <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                        {product.title}
                      </p>
                      <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                        ${product.discountedPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section class="px-3 py-5 bg-neutral-100 lg:py-10">
        <div class="grid lg:grid-cols-2 items-center justify-items-center gap-5">
          <div class="order-2 lg:order-1 flex flex-col justify-center items-center">
            <p class="text-4xl font-bold md:text-7xl text-orange-600">
              25% OFF
            </p>
            <p class="text-4xl font-bold md:text-7xl">SUMMER SALE</p>
            <p class="mt-2 text-sm md:text-lg">For limited time only!</p>
            <button 
            onClick={() => navigate('/products')}
            class="text-lg md:text-2xl bg-black text-white py-2 px-5 mt-10 hover:bg-zinc-800 cursor-pointer">
              Shop Now
            </button>
          </div>
          <div class="order-1 lg:order-2">
            <img
              class="h-80 w-80 object-cover lg:w-[500px] lg:h-[500px]"
              src="https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHNob2VzfGVufDB8fDB8fHww"
              alt=""
            />
          </div>
        </div>
      </section>
    </div>
  );
};
