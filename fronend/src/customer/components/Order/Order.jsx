import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import OrderCard from "./OrderCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrderHistory } from "../../../State/Order/Action";
import Spinner from "../../components/Spinner/Spinner";

const orderStatus = [
  { label: "On The Way", value: "on_the_way" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "return" },
];

const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.order.orders);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const selectedStatusFromQuery = orderStatus
      .filter((status) => queryParams.get(status.value) === "true")
      .map((status) => status.value);
    setSelectedStatus(selectedStatusFromQuery);
  }, [location.search]);

  useEffect(() => {
    if (orders) {
      const filtered =
        selectedStatus.length === 0
          ? orders
          : orders.filter((order) =>
              selectedStatus.includes(order.orderStatus)
            );
      setFilteredOrders(filtered);
    }
  }, [selectedStatus, orders]);

  const handleFilter = (value) => {
    const newStatus = selectedStatus.includes(value)
      ? selectedStatus.filter((status) => status !== value)
      : [...selectedStatus, value];
    setSelectedStatus(newStatus);
    const query = newStatus.map((status) => `${status}=true`).join("&");
    navigate({ search: `?${query}` });
  };

  return (
    <div className="py-5 px-5 lg:px-20">
      <Grid container sx={{ justifyContent: "space-between" }}>
        {/* Filter Section */}
        <Grid item xs={2.5}>
          <div className="h-auto shadow-lg bg-white p-5 sticky top-5">
            <h1 className="font-bold text-lg">Filter</h1>
            <div className="space-y-4 mt-10">
              <h1 className="font-semibold">ORDER STATUS</h1>
              {orderStatus?.map((option) => (
                <div className="flex items-center" key={option.value}>
                  <input
                    type="checkbox"
                    checked={selectedStatus.includes(option.value)}
                    onChange={() => handleFilter(option.value)}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    id={option.value}
                  />
                  <label
                    className="ml-3 text-sm text-gray-600"
                    htmlFor={option.value}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Grid>

        {/* Orders Section */}
        <Grid item xs={9}>
          {loading ? (
            <Spinner /> // Show Spinner while loading
          ) : (
            <div className="space-y-5">
              {filteredOrders?.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Order;
