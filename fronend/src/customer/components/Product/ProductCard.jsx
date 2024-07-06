import React from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate=useNavigate();
  return (
    <div onClick={()=>navigate(`/product/${product?._id}`)} className="productCard w-[15rem] my-9 transition-all cursor-pointer mx-9 rounded-lg">
      <div className="h-[15rem] ">
        <img
          className="h-[13rem] w-[13rem] object-cover object-left-top rounded-t-lg"
          src={product?.imageUrl}
          alt="not found"
        />
      </div>
      <div className="textPart bg-white p-3 ">
        <p className="font-bold text-lg opacity-60">{product?.brand}</p>
        <p className="py-1">{product?.title}</p>
        <div className="flex items-center space-x-2">
          <p className="font-semibold">${product?.discountedPrice}</p>
          <p className="line-through opacity-50 py-1">
            ${product?.price}
          </p>
          <p className="text-green-600 font-semibold">{product?.discountedPersent}% off</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;



