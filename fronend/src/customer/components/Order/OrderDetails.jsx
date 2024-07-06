import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddressCard from "../AddressCard/AddressCard";
import OrderTracker from "./OrderTracker";
import { Box, Grid } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useDispatch, useSelector } from "react-redux";
import { getOrderHistory } from "../../../State/Order/Action";
import Spinner from "../../components/Spinner/Spinner";

const OrderDetails = () => {
  const { orderId } = useParams();
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    dispatch(getOrderHistory());
  }, [dispatch]);

  const selectedOrder = orders?.find((order) => order._id === orderId);
  console.log(selectedOrder);

  const handleRateReview = (productId) => {
    navigate(`/rate-review/${productId}`);
  };

  return (
    <div className="py-5 px-5 lg:px-20">
      <div>
        <h1 className="font-bold text-xl py-5">Delivery Address</h1>
        <AddressCard address={selectedOrder?.shippingAddress} />
      </div>
      <div className="py-20">
        <OrderTracker activeStep={3} />
      </div>
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <Grid container className="space-y-5">
          {selectedOrder?.orderItems?.map((item) => (
            <Grid
              item
              container
              className=" shadow-xl rounded-xl p-5 border hover:shadow-gray-400 "
              sx={{ alignItems: "center", justifyContent: "space-between" }}
              key={item._id}
            >
              <Grid item xs={6}>
                <div className="flex items-center space-x-4">
                  <img
                    className="w-[7.5rem] h-[7.5rem] object-cover object-top"
                    src={item?.product?.imageUrl}
                    alt={item?.product?.title}
                  />
                  <div className="space-y-2 ml-5 ">
                    <p className=" text-lg font-semibold">
                      {item?.product?.title}
                    </p>
                    <p className="space-x-5 opacity-50 text-xs font-semibold">
                      <span>Color: {item?.product?.color}</span>
                      <span>Size: {item?.size}</span>
                    </p>
                    <p className="text-md ">${item?.price}</p>
                  </div>
                </div>
              </Grid>

              <Grid item>
                {/* Use navigate to programmatically navigate for Ratings and Reviews */}
                <Box
                  sx={{ color: deepPurple[500], cursor: "pointer" }}
                  onClick={() => handleRateReview(item?.product?._id)}
                >
                  <StarBorderIcon sx={{ fontSize: "2rem" }} className="px-2" />
                  <span>Rate & Review Product</span>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default OrderDetails;
