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
} from "@mui/material";

const OrderTableView = () => {
  const [anchorEl, setAnchorEl] = useState([]);
  const open = Boolean(anchorEl);

  const handleClick = (event,index) => {
    const newAnchorElArray=[...anchorEl];
    newAnchorElArray[index]=event.currentTarget;
    setAnchorEl(newAnchorElArray);
  };
  

  const handleClose = (index) => {
    const newAnchorElArray=[...anchorEl];
    newAnchorElArray[index]=null;
    setAnchorEl(newAnchorElArray);
  };
  const dispatch = useDispatch();
  const { adminOrder } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getOrders());
  }, [adminOrder.confirmed, adminOrder.shipped, adminOrder.delivered,adminOrder.deletedOrder]);

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
    dispatch(deleteOrder(orderId));
  };

  return (
    <div className="p-5">
      <Card className="mt-2">
        <CardHeader title="Recent Orders" />
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell align="left">Title</TableCell>
                <TableCell align="left">Id</TableCell>
                <TableCell align="left">Price&nbsp;($)</TableCell>
                <TableCell align="left">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminOrder?.orders?.map((item, index) => (
                <TableRow
                  key={item.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </div>
  );
};

export default OrderTableView;
