import { AccountCircle, TrendingUp } from "@mui/icons-material";
import {
  Grid,
  Box,
  Avatar,
  Typography,
  Card,
  CardHeader,
  IconButton,
  CardContent,
} from "@mui/material";
import React from "react";
import PhonelinkRingIcon from "@mui/icons-material/PhonelinkRing";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoreVertIcon from "@mui/icons-material/MoreVert";
const salesData = [
  {
    stats: "245k",
    title: "Sales",
    color: "#FBD28B",
    icon: <TrendingUp sx={{ fontSize: "1.75rem" }} />,
  },
  {
    stats: "12.5k",
    title: "Customers",
    color: "#F4C724",
    icon: <AccountCircle sx={{ fontSize: "1.75rem" }} />,
  },
  {
    stats: "1.54k",
    title: "Products",
    color: "#FF6600",
    icon: <PhonelinkRingIcon sx={{ fontSize: "1.75rem" }} />,
  },
  {
    stats: "88k",
    title: "Revenue",
    color: "#45CE30",
    icon: <AttachMoneyIcon sx={{ fontSize: "1.75rem" }} />,
  },
];

const renderStats = () => {
  return salesData.map((item, index) => (
    <Grid item xs={12} sm={3} key={index}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            mr: 3,
            width: 44,
            height: 44,
            boxShadow: 3,
            color: "white",
            background: `${item.color}`,
          }}
        >
          {item.icon}
        </Avatar>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="caption">{item.title}</Typography>
          <Typography variant="h6">{item.stats}</Typography>
        </Box>
      </Box>
    </Grid>
  ));
};
const MonthlyOverview = () => {
  return (
    // bgcolor:"#242B2E",color:"white"
    <Card >
      <CardHeader
        title="Monthly Overview"
        action={
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        }
        subheader={
          <Typography variant="body2">
            <Box
              component="span"
              sx={{ fontWeight: 600 , }}
            >
              Total 48.5% growth
            </Box>{" "}
            📊 this month
          </Typography>
        }
        titleTypographyProps={{
          sx: {
            mb: 2.5,
            lineHeight: "2rem !important",
            letterSpacing: ".15px !important",
          },
        }}
      />
      <CardContent
        sx={{
          pt: (theme) => `${theme.spacing(3)} !important`,
        }}
      >
        <Grid container spacing={[5, 0]}>
          {renderStats()}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MonthlyOverview;
