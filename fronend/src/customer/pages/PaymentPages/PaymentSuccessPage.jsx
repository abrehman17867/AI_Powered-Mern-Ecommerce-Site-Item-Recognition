import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from "../../components/Spinner/Spinner";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-2">
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <div className="bg-white p-8 md:p-16">
          <svg className="w-16 h-16 animate-fadeIn animate-pulse text-blue-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h1 className="text-4xl font-bold text-blue-500 mb-4">Payment Successful</h1>
          <p className="text-lg text-gray-700 mb-8 text-center">Your payment was successful. Thank you for your purchase!</p>
          <button 
            onClick={() => navigate('/products')} 
            className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-2 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
