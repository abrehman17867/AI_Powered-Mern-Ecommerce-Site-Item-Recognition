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
  Button,
  Card,
  CardHeader,
  Alert,
  AlertTitle,
} from "@mui/material";
import { deleteProduct, findProducts } from "../../State/Product/Action";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "@mui/material/Pagination";
import Spinner from "../../customer/components/Spinner/Spinner";

const ProductsTable = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((store) => store);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  const handleProductDelete = (productId) => {
    setLoading(true);
    dispatch(deleteProduct(productId))
      .then(() => {
        setAlert({ severity: "success", message: "Product deleted successfully!" });
      })
      .catch(() => {
        setAlert({ severity: "error", message: "Error deleting product!" });
      })
      .finally(() => setLoading(false));
  };

  const handlePaginationChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    const data = {
      category: "",
      colors: [],
      sizes: [],
      minPrice: 0,
      maxPrice: 100000,
      minDiscount: 0,
      sort: "price_low",
      pageNumber: currentPage,
      pageSize: 9,
      stock: "",
    };
    dispatch(findProducts(data));
  }, [currentPage, products.deletedProduct]);

  return (
    <div className="p-5 ">
      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)}>
          <AlertTitle>{alert.severity === "success" ? "Success" : "Error"}</AlertTitle>
          {alert.message}
        </Alert>
      )}
      <Card className="mt-2">
        <CardHeader title="All Products" />
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
                  <TableCell align="left">Category</TableCell>
                  <TableCell align="left">Price&nbsp;($)</TableCell>
                  <TableCell align="left">Quantity</TableCell>
                  <TableCell align="left">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products?.products?.content?.map((item, index) => (
                  <TableRow
                    key={item._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="left">
                      {(currentPage - 1) * 7 + index + 1}
                    </TableCell>{" "}
                    {/* Calculate the index based on the current page */}
                    <TableCell align="left">
                      <Avatar src={item.imageUrl} />
                    </TableCell>
                    <TableCell align="left">{item.title}</TableCell>
                    <TableCell align="left">{item.category.name}</TableCell>
                    <TableCell align="left">{item.price}</TableCell>
                    <TableCell align="left">{item.quantity}</TableCell>
                    <TableCell align="left">
                      <Button
                        onClick={() => handleProductDelete(item._id)}
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
      <section className="w-full px-[3.6rem]">
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

export default ProductsTable;
