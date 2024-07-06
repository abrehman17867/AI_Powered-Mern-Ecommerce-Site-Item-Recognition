import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
  Card,
  CardHeader,
  Alert,
  AlertTitle,
  Pagination,
} from "@mui/material";
import Spinner from "../../customer/components/Spinner/Spinner";
import { api } from "../../config/apiConfig";

const CustomersTable = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/api/users");
        setUsers(response.data);
      } catch (err) {
        setAlert({ severity: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // const handlePaginationChange = (event, value) => {
  //   setCurrentPage(value);
  // };

  return (
    <div className="p-5">
      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)}>
          <AlertTitle>{alert.severity === "success" ? "Success" : "Error"}</AlertTitle>
          {alert.message}
        </Alert>
      )}
      <Card className="mt-2">
        <CardHeader title="All Customers" />
        <TableContainer component={Paper}>
          {loading ? (
            <Spinner /> // Show Spinner while loading
          ) : (
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Avatar</TableCell>
                  <TableCell align="left">First Name</TableCell>
                  <TableCell align="left">Last Name</TableCell>
                  <TableCell align="left">Email</TableCell>
                  <TableCell align="left">Role</TableCell>
                  <TableCell align="left">Mobile</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow
                    key={user._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell align="left">
                      <Avatar src={user.avatar} />
                    </TableCell>
                    <TableCell align="left">{user.firstName}</TableCell>
                    <TableCell align="left">{user.lastName}</TableCell>
                    <TableCell align="left">{user.email}</TableCell>
                    <TableCell align="left">{user.role}</TableCell>
                    <TableCell align="left">{user.mobile}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>
      <section className="w-full px=[3.6rem]">
        {/* <div className="px-4 py-5 flex justify-center">
          {loading ? (
            <Spinner /> // Show Spinner while loading
          ) : (
            <Pagination
              count={10} // Change this to the actual number of pages
              color="secondary"
              onChange={handlePaginationChange}
            />
          )}
        </div> */}
      </section>
    </div>
  );
};
export default CustomersTable;