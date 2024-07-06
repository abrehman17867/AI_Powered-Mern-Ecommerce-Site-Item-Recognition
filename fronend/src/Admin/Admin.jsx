import React, { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import {
  useMediaQuery,
  Box,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  CssBaseline,
  Drawer,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import CreateProductForm from "./components/CreateProductForm";
import ProductsTable from "./components/ProductsTable";
import OrdersTable from "./components/OrdersTable";
import CustomersTable from "./components/CustomersTable";
import AdminDashboard from "./components/Dashboard";

const menu = [
  { name: "Dashboard ", path: "/admin", icon: <DashboardIcon /> },
  { name: "Products ", path: "/admin/products ", icon: <Inventory2Icon /> },
  { name: "Customers ", path: "/admin/customers ", icon: <PeopleAltIcon /> },
  { name: "Orders ", path: "/admin/orders", icon: <ShoppingBasketIcon /> },
  {
    name: "AddProduct ",
    path: "/admin/product/create ",
    icon: <ShoppingCartIcon />,
  },
];

const Admin = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [sideBarVisible, setSideBarVisible] = useState(false);
  const navigate = useNavigate();

  const drawer = (
    <Box
      sx={{
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      {/* {isLargeScreen && <Toolbar />} */}
      <List>
        {menu.map((item) => (
          <ListItem
            key={item.name}
            disablePadding
            onClick={() => navigate(item.path)}
          >
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.name}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <AccountBoxIcon />
            </ListItemIcon>
            <ListItemText>Account</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div className="relative flex h-[100vh] ">
      <CssBaseline />

      <div className="shadow-lg shadow-gray-600 w-[15%]  h-full fixed top-0 ">
        {drawer}
      </div>

      <div className="w-[85%] h-full ml-[15%]">
        <Routes>
          <Route path="/" element={<AdminDashboard />}></Route>
          <Route path="/product/create" element={<CreateProductForm />}></Route>
          <Route path="/products" element={<ProductsTable />}></Route>
          <Route path="/orders" element={<OrdersTable />}></Route>
          <Route path="/customers" element={<CustomersTable />}></Route>
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
