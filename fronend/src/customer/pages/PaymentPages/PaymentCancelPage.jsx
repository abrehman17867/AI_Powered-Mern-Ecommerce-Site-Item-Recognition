import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <div className="bg-white p-10 text-center animate-fadeIn">
        <h1 className="text-4xl font-bold text-red-500 mb-4 animate-pulse">Payment Cancelled</h1>
        <p className="text-lg text-gray-700 mb-8">Your payment was cancelled. If you have any questions, please contact support.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-2 px-6 rounded transition-transform transform hover:scale-105"
        >
          Go Back To Home
        </button>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
