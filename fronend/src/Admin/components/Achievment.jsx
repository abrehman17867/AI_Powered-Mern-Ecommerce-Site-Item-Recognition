import React from "react";
import { styled, Card, CardContent, Typography, Button } from "@mui/material";
import trophy from "../../data/Admin/trophy.png";

const TriangleImg = styled("img")({
  right: 0,
  bottom: 0,
  height: 17,
  position: "absolute",
});

const TrophyImg = styled("img")({
  right: 26,
  bottom: 20,
  height: 98,
  position: "absolute",
});

const Achievment = () => {
  return (
    // bgcolor: "#242B2E", color: "white" 
    <Card sx={{ position: "relative"}}>
      <CardContent>
        <Typography variant="h6" sx={{ letterSpacing: ".85px" }}>
          Company
        </Typography>
        <Typography variant="body2">Congratulations 🥳</Typography>
        <Typography variant="h5" sx={{ my: 3.1 }}>
          420.8k
        </Typography>

        <Button size="small" variant="contained">
          View Sales
        </Button>
        <TriangleImg src="" />
        <TrophyImg src={trophy} />
      </CardContent>
    </Card>
  );
};

export default Achievment;
