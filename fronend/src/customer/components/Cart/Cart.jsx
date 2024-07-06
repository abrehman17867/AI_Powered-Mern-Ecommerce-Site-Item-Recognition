import React, { useEffect, useState } from "react";
import CartItem from "./CartItem";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "../../../State/Cart/Action";
import Spinner from "../../components/Spinner/Spinner";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((store) => store);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  const handleCheckout = () => {
    navigate("/checkout?step=2");
  };

  useEffect(() => {
    dispatch(getCart());
  }, [cart.updateCartItem, cart.deleteCartItem]);

  return (
    <div className="py-5">
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <div className="lg:grid grid-cols-3 lg:px-16 relative">
          <div className="col-span-2 ">
            {cart?.cart &&
              cart?.cart?.cartItems &&
              cart?.cart?.cartItems?.length > 0 &&
              cart?.cart?.cartItems?.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            {/* {cart.cart?.cartItems?.map((item) => (
            <CartItem item={item} />
          ))} */}
          </div>
          <div className="px-5 sticky top-0 h-[100vh] mt-5 lg:mt-0 ">
            <div className=" p-3 shadow-lg border rounded-md">
              <p className="uppercase font-bold opacity-60 pb-4 ">
                Price Details
              </p>
              <hr />

              <div className="space-y3 font-semibold mb-10">
                <div className="flex justify-between pt-3 text-black">
                  <span>Price</span>
                  <span>{cart.cart?.totalPrice}</span>
                </div>
                <div className="flex justify-between pt-3 ">
                  <span>Discount</span>
                  <span className="text-green-600">{cart.cart?.discounte}</span>
                </div>
                <div className="flex justify-between pt-3 ">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between pt-3 font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">
                    {cart.cart?.totalDiscountedPrice}{" "}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                variant="contained"
                className="w-full mt-5"
                sx={{ px: "2.5rem", py: "0.7rem", bgcolor: "#9155fd" }}
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
