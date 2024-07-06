import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useLocation, useNavigate } from "react-router-dom";
import DeliveryAddressForm from "./DeliveryAddressForm";
import { OrderSummary } from "./OrderSummary";
import Spinner from "../../components/Spinner/Spinner";
import { useState } from "react";
import { useEffect } from "react";

const steps = ["Login", "Delivery Address", "Order Summary", "Payment"];

export default function CheckOut() {
  const location = useLocation();
  const navigate = useNavigate();
  const querySearch = new URLSearchParams(location.search);
  const step = parseInt(querySearch.get("step") || "0", 10); // Convert step to integer
  const [loading, setLoading] = useState(true);
  // const handleNext = () => {
  //   navigate(`/checkout?step=${step + 1}`);
  // };

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    const previousStep = step - 1;
    if (previousStep >= 1) {
      navigate(`/checkout?step=${previousStep}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <div className="py-7 px-10 lg:px-20">
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <Box sx={{ width: "100%" }}>
          <Stepper activeStep={step}>
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};

              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {step === steps.length + 1 ? (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you&apos;re finished
              </Typography>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={step === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
              </Box>
              <div className="mt-10">
                {step === 2 ? (
                  <DeliveryAddressForm />
                ) : step === 3 ? (
                  <OrderSummary />
                ) : step === 4 ? (
                  <CheckOut />
                ) : (
                  <div>Step: {step}</div>
                )}
              </div>
            </React.Fragment>
          )}
        </Box>
      )}
    </div>
  );
}
