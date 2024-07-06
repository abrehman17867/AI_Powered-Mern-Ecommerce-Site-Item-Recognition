import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  confirmOrder,
  deleteOrder,
  deliveredOrder,
  getOrders,
  shipOrder,
} from "../../State/Admin/Order/Action";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardHeader,
  Menu,
  MenuItem,
  Alert,
  AlertTitle,
} from "@mui/material";
import Spinner from "../../customer/components/Spinner/Spinner";
import Pagination from "@mui/material/Pagination";


const OrdersTable = () => {
  const [anchorEl, setAnchorEl] = useState([]);
  const open = Boolean(anchorEl);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { products } = useSelector((store) => store);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  const handlePaginationChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleClick = (event, index) => {
    const newAnchorElArray = [...anchorEl];
    newAnchorElArray[index] = event.currentTarget;
    setAnchorEl(newAnchorElArray);
  };

  const handleClose = (index) => {
    const newAnchorElArray = [...anchorEl];
    newAnchorElArray[index] = null;
    setAnchorEl(newAnchorElArray);
  };
  const dispatch = useDispatch();
  const { adminOrder } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getOrders());
  }, [
    adminOrder.confirmed,
    adminOrder.shipped,
    adminOrder.delivered,
    adminOrder.deletedOrder,
  ]);

  console.log("Admin Orders ", adminOrder);

  const handleShippedOrder = (orderId) => {
    dispatch(shipOrder(orderId));
    handleClose();
  };

  const handleConfirmedOrder = (orderId) => {
    dispatch(confirmOrder(orderId));
    handleClose();
  };

  const handleDeliveredOrder = (orderId) => {
    dispatch(deliveredOrder(orderId));
    handleClose();
  };

  const handleDeleteOrder = (orderId) => {
    setLoading(true);
    dispatch(deleteOrder(orderId))
    .then(() => {
      setAlert({ severity: "success", message: "Order deleted successfully!" });
    })
    .catch(() => {
      setAlert({ severity: "error", message: "Error deleting order!" });
    })
    .finally(() => setLoading(false));
  };

  return (
    <div className="p-5">
      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)}>
          <AlertTitle>{alert.severity === "success" ? "Success" : "Error"}</AlertTitle>
          {alert.message}
        </Alert>
      )}
      <Card className="mt-2">
        <CardHeader title="All Orders" />
        <TableContainer component={Paper}>
          {loading ? (
            <Spinner /> // Show Spinner while loading
          ) : (
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell align="left">Title</TableCell>
                  <TableCell align="left">Id</TableCell>
                  <TableCell align="left">Price&nbsp;($)</TableCell>
                  <TableCell align="left">Status</TableCell>
                  <TableCell align="left">Update</TableCell>
                  <TableCell align="left">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminOrder?.orders?.map((item, index) => (
                  <TableRow
                    key={item.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell align="left">
                      <AvatarGroup max={3} sx={{ justifyContent: "start" }}>
                        {item?.orderItems?.map((orderItem) => (
                          <Avatar src={orderItem?.product?.imageUrl} />
                        ))}
                      </AvatarGroup>
                    </TableCell>

                    <TableCell align="left" scope="row">
                      {item?.orderItems?.map((orderItem) => (
                        <p> {orderItem?.product?.title}</p>
                      ))}
                    </TableCell>
                    <TableCell align="left">{item?._id}</TableCell>
                    <TableCell align="left">{item?.totalPrice}</TableCell>
                    <TableCell align="left">
                      <span
                        className={`text-white px-5 py-2 rounded-full 
                      ${
                        item?.orderStatus === "CONFIRMED"
                          ? "bg-[#277e27]"
                          : item?.orderStatus === "SHIPPED"
                          ? "bg-[#313169]"
                          : item?.orderStatus === "PLACED"
                          ? "bg-[#a6bd26]"
                          : item?.orderStatus === "PENDING"
                          ? "bg-[#4a6868]"
                          : "bg-[#21a064]"
                      }`}
                      >
                        {item?.orderStatus}
                      </span>
                    </TableCell>

                    <TableCell align="left">
                      <Button
                        id="basic-button"
                        aria-haspopup="true"
                        onClick={(event) => handleClick(event, index)}
                        aria-controls={`basic-menu-${item._id}`}
                        aria-expanded={Boolean(anchorEl[index])}
                      >
                        Status
                      </Button>
                      <Menu
                        id={`basic-menu-${item._id}`}
                        anchorEl={anchorEl[index]}
                        open={Boolean(anchorEl[index])}
                        onClose={() => handleClose(index)}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                      >
                        <MenuItem
                          onClick={() => handleConfirmedOrder(item._id)}
                        >
                          Confirmed
                        </MenuItem>
                        <MenuItem onClick={() => handleShippedOrder(item._id)}>
                          Shipped
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeliveredOrder(item._id)}
                        >
                          Delivered
                        </MenuItem>
                      </Menu>
                    </TableCell>

                    <TableCell align="left">
                      <Button
                        onClick={() => handleDeleteOrder(item._id)}
                        variant="outlined"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>
      <section className="w-full px=[3.6rem]">
        <div className="px-4 py-5 flex justify-center">
          {loading ? (
            <Spinner /> // Show Spinner while loading
          ) : (
            <Pagination
              count={products.products?.totalPages}
              color="secondary"
              onChange={handlePaginationChange}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default OrdersTable;
