import React, { useEffect, useState } from "react";
import AddressCard from "../AddressCard/AddressCard";
import { Button } from "@mui/material";
import CartItem from "../Cart/CartItem";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById } from "../../../State/Order/Action";
import { useLocation } from "react-router-dom";
import { api } from "../../../config/apiConfig";
import { loadStripe } from "@stripe/stripe-js";
import Spinner from "../../components/Spinner/Spinner";

export const OrderSummary = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { order } = useSelector((store) => store);
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("order_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    dispatch(getOrderById(orderId));
  }, [dispatch, orderId]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/payments/create-checkout-session", {
        orderItems: order?.order?.orderItems,
      });

      console.log("Checkout session response:", response.data); // Log the response

      const sessionId = response.data.sessionId;

      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

      console.log(
        "Attempting to redirect to checkout with sessionId:",
        sessionId
      ); // Log sessionId before redirection

      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        console.error("Stripe checkout error:", error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-s-md border">
        <AddressCard address={order?.order?.shippingAddress} />
      </div>

      <div className="py-5">
        {loading ? (
          <Spinner /> // Show Spinner while loading
        ) : (
          <div className="lg:grid grid-cols-3 relative">
            <div className="col-span-2">
              {order?.order?.orderItems.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
            <div className="px-5 sticky top-0 h-[100vh] mt-5 lg:mt-0">
              <div className="p-3 shadow-lg border rounded-md">
                <p className="uppercase font-bold opacity-60 pb-4">
                  Price Details
                </p>
                <hr />

                <div className="space-y3 font-semibold mb-10">
                  <div className="flex justify-between pt-3 text-black">
                    <span>Price</span>
                    <span>${order?.order?.totalPrice}</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span>Discount</span>
                    <span className="text-green-600">
                      ${order?.order?.discount}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span>Delivery Charges</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between pt-3 font-bold">
                    <span>Total Amount</span>
                    <span className="text-green-600">
                      ${order?.order?.totalDiscountedPrice}
                    </span>
                  </div>
                </div>
                <Button
                  variant="contained"
                  className="w-full mt-5"
                  sx={{ px: "2.5rem", py: "0.7rem", bgcolor: "#9155fd" }}
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
