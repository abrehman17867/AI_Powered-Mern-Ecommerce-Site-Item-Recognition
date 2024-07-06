import { Grid } from "@mui/material";
import React from "react";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import { useNavigate } from "react-router-dom";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const orderDate = new Date(order?.orderDate);
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  

  return (
    <div

      onClick={() => navigate(`/account/order/${order?._id}`)}
      className="p-5 shadow-sm shadow-slate-500  hover:shadow-2xl border rounded-bl-3xl"
    >
      {order?.orderItems.map((item, index) => (
        <Grid key={index} container spacing={2} sx={{ justifyContent: "space-between" }}>
          <Grid item xs={6}>
            <div className="flex cursor-pointer">
              <img
                className="w-[5rem] h-[5rem] object-cover object-top"
                src={item?.product?.imageUrl}
                alt={item?.product?.title}
              />
              <div className="ml-5 space-y-2">
                <p className="">{item?.product?.title}</p>
                <p className="opacity-50 text-xs font-semibold">Size: {item?.size}</p>
                <p className="opacity-50 text-xs font-semibold">Color: {item?.product?.color}</p>
              </div>
            </div>
          </Grid>
          <Grid item xs={2}>
            <p>${item?.price}</p>
          </Grid>
          <Grid item xs={4}>
            {order?.paymentDetails?.paymentSatus === "PENDING" && (
              <p>
                <span>Expected Delivery On {deliveryDate.toLocaleDateString()}</span>
              </p>
            )}
            {order?.paymentDetails?.paymentSatus === "PAID" && (
              <div>
                <p>
                  <DeliveryDiningIcon
                    sx={{ width: "20px", height: "20px" }}
                    className="text-green-600 mr-2 text-sm"
                  />
                </p>
                <span>Delivered On {orderDate.toLocaleDateString()}</span>
                <p className="text-xs">Your Item Has Been Delivered</p>
              </div>
            )}
          </Grid>
        </Grid>
      ))}
    </div>
  );
};

export default OrderCard;
