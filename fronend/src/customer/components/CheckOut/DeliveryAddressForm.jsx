import { Box, Button, Grid, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import AddressCard from "../AddressCard/AddressCard";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../../State/Order/Action";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";

const DeliveryAddressForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  console.log("Auth  : ", auth.user);

  const handleDeliverHere = (address) => {
    const orderData = { address, navigate };
    dispatch(createOrder(orderData));
    console.log("address", address);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const address = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      streetAddress: data.get("address"),
      city: data.get("city"),
      state: data.get("state"),
      zipCode: data.get("zip"),
      mobile: data.get("phoneNumber"),
    };
    handleDeliverHere(address);
  };

  return (
    <div>
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <Grid container spacing={4}>
          <Grid
            item
            xs={12}
            lg={5}
            className="border rounded-e-md shadow-md h-[30.5rem] overflow-y-scroll"
          >
            <div className="p-5 py-7 border-b cursor-pointer">
              {auth.user?.address.map((item) => (
                <div key={item._id}>
                  <AddressCard address={item} />
                  <Button
                    sx={{ py: 1.5, mt: 2, bgcolor: "rgb(145 85 253)" }}
                    size="large"
                    variant="contained"
                    onClick={() => handleDeliverHere(item)}
                  >
                    Deliver Here
                  </Button>
                </div>
              ))}

              {/* <div className="space-y-3">
              <p className="font-semibold">{auth.user?.firstName + " " + auth.user?.lastName}</p>
              <p className="font-semibold">{auth.user?.email}</p>
            </div> */}
            </div>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Box className="border rounded-s-md shadow-md p-5">
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      fullWidth
                      autoComplete="given-name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      fullWidth
                      autoComplete="given-name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      id="address"
                      name="address"
                      label="Address"
                      fullWidth
                      autoComplete="given-name"
                      multiline
                      rows={4}
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="city"
                      name="city"
                      label="City"
                      fullWidth
                      autoComplete="given-name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="state"
                      name="state"
                      label="State /Province /Region"
                      fullWidth
                      autoComplete="given-name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="zipCode"
                      name="zip"
                      label="Zip /Postal Code"
                      fullWidth
                      autoComplete="shipping postal-code"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="mobile"
                      name="phoneNumber"
                      label="Phone Number"
                      fullWidth
                      autoComplete="given-name"
                      style={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      sx={{ py: 1.5, mt: 2, bgcolor: "rgb(145 85 253)" }}
                      size="large"
                      variant="contained"
                      type="submit"
                    >
                      Deliver Here
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default DeliveryAddressForm;
