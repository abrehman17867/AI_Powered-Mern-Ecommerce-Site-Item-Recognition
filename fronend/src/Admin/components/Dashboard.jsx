import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import Achievment from "./Achievment";
import MonthlyOverview from "./MonthlyOverview";
import ProductTableView from "../View/ProductTableView";
import OrderTableView from "../View/OrderTableView";
import Spinner from "../../customer/components/Spinner/Spinner";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-10">
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <div className="shadow-lg shadow-gray-600">
              <Achievment />
            </div>
          </Grid>
          <Grid item xs={12} md={8}>
            <div className="shadow-lg shadow-gray-600">
              <MonthlyOverview />
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className="shadow-lg shadow-gray-600">
              <OrderTableView />
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className="shadow-lg shadow-gray-600">
              <ProductTableView />
            </div>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default AdminDashboard;
