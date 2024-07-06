import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { Alert, AlertTitle } from "@mui/material";
import {
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Fragment } from "react";
import { useDispatch } from "react-redux";
import { createProduct } from "../../State/Product/Action";
import { api } from "../../config/apiConfig";
import Spinner from "../../customer/components/Spinner/Spinner";

const initialSizes = [
  { name: "S", quantity: 0 },
  { name: "M", quantity: 0 },
  { name: "L", quantity: 0 },
];

const CreateProductForm = () => {
  const [selectImage, setSelectedImage] = useState({});
  const [alert, setAlert] = useState(null);
  const [productData, setProductData] = useState({
    photo: "",
    brand: "",
    title: "",
    color: "",
    discountedPrice: "",
    price: "",
    discountedPersent: "",
    size: initialSizes,
    quantity: "",
    topLevelCategory: "",
    secondLevelCategory: "",
    thirdLevelCategory: "",
    description: "",
  });
  const [thirdLevelCategoryOptions, setThirdLevelCategoryOptions] = useState(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "topLevelCategory" || name === "secondLevelCategory") {
      let newOptions = [];

      if (productData.topLevelCategory === "men" && value === "shoes") {
        newOptions = [
          "sneakers",
          "boots",
          "dress shoes",
          "loafers",
          "slippers",
          "athletic shoes",
        ];
      } else if (
        productData.topLevelCategory === "men" &&
        value === "clothing"
      ) {
        newOptions = ["shirts", "pants", "jackets"];
      } else if (
        productData.topLevelCategory === "men" &&
        value === "accessories"
      ) {
        newOptions = ["belts", "wallets", "ties", "hats", "sunglasses"];
      } else if (
        productData.topLevelCategory === "women" &&
        value === "shoes"
      ) {
        newOptions = ["sandals", "heels", "flats", "boots"];
      } else if (
        productData.topLevelCategory === "women" &&
        value === "clothing"
      ) {
        newOptions = ["dresses", "tops", "pants", "jackets"];
      } else if (
        productData.topLevelCategory === "women" &&
        value === "accessories"
      ) {
        newOptions = ["handbags", "scarves", "jewelry", "hats", "sunglasses"];
      }
      setThirdLevelCategoryOptions(newOptions);
    }
  };

  const handleSizeChange = (e, index) => {
    let { name, value } = e.target;
    name === "size_quantity" ? (name = "quantity") : (name = e.target.name);

    const sizes = [...productData.size];
    sizes[index][name] = value;
    setProductData((prevState) => ({
      ...prevState,
      size: sizes,
    }));
  };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setAlert(null); 
  //   const formData = new FormData();
  //   formData.append("photo", selectImage?.file);
  //   formData.append("brand", productData.brand);
  //   formData.append("title", productData.title);
  //   formData.append("color", productData.color);
  //   formData.append("price", productData.price);
  //   formData.append("discountedPrice", productData.discountedPrice);
  //   formData.append("quantity", productData.quantity);
  //   formData.append("discountedPersent", productData.discountedPersent);
  //   formData.append("topLevelCategory", productData.topLevelCategory);
  //   formData.append("description", productData.description);
  //   formData.append("secondLevelCategory", productData.secondLevelCategory);
  //   formData.append("thirdLevelCategory", productData.thirdLevelCategory);

  //   const { data } = await api.post(`/api/admin/products`, formData, {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //     },
      
  //   });
  //   setAlert({ severity: "success", message: "Product is created successfully!" });
  //   console.log(data);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null); 
    const formData = new FormData();
    formData.append("photo", selectImage?.file);
    formData.append("brand", productData.brand);
    formData.append("title", productData.title);
    formData.append("color", productData.color);
    formData.append("price", productData.price);
    formData.append("discountedPrice", productData.discountedPrice);
    formData.append("quantity", productData.quantity);
    formData.append("discountedPersent", productData.discountedPersent);
    formData.append("topLevelCategory", productData.topLevelCategory);
    formData.append("description", productData.description);
    formData.append("secondLevelCategory", productData.secondLevelCategory);
    formData.append("thirdLevelCategory", productData.thirdLevelCategory);
  
    try {
      const { data } = await api.post(`/api/admin/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setAlert({ severity: "success", message: "Product is created successfully!" });
      setProductData({
        photo: "",
        brand: "",
        title: "",
        color: "",
        discountedPrice: "",
        price: "",
        discountedPersent: "",
        size: initialSizes,
        quantity: "",
        topLevelCategory: "",
        secondLevelCategory: "",
        thirdLevelCategory: "",
        description: "",
      });
      setSelectedImage({});
    } catch (error) {
      setAlert({ severity: "error", message: "Product creation failed!" });
    }
  };
  

  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     try {
  //       const url = URL.createObjectURL(file);
  //       setSelectedImage({ file, url });
  //     } catch (error) {
  //       console.error("Error creating object URL:", error);
  //     }
  //   } else {
  //     console.error("No file selected");
  //   }
  // };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validFileTypes = ["image/jpeg", "image/png", "image/jpg"]; // Add more valid types as needed
      if (validFileTypes.includes(file.type)) {
        try {
          const url = URL.createObjectURL(file);
          setSelectedImage({ file, url });
          setAlert(null); // Clear any existing alerts
        } catch (error) {
          console.error("Error creating object URL:", error);
          setAlert({ severity: "error", message: "Error creating object URL" });
        }
      } else {
        setAlert({ severity: "error", message: "File type is not valid" });
      }
    } else {
      console.error("No file selected");
      setAlert({ severity: "error", message: "No file selected" });
    }
  };

  return (
    <div className="p-10">
      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)}>
          <AlertTitle>{alert.severity === "error" ? "Error" : "Success"}</AlertTitle>
          {alert.message}
        </Alert>
      )}
      <Typography
        variant="h3"
        sx={{ textAlign: "center" }}
        className="py-10 text-center"
      >
        Add New Product
      </Typography>
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <form onSubmit={handleSubmit} className="min-h-screen">
          <Fragment>
            <Grid container spacing={2}>
              <Grid item sx={6} sm={12}>
                <input
                  name="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={productData.brand}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={productData.title}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  name="color"
                  value={productData.color}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  value={productData.quantity}
                  onChange={handleChange}
                  type="number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  value={productData.price}
                  onChange={handleChange}
                  type="number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Discounted Price"
                  name="discountedPrice"
                  value={productData.discountedPrice}
                  onChange={handleChange}
                  type="number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Discounted Percentage"
                  name="discountedPersent"
                  value={productData.discountedPersent}
                  onChange={handleChange}
                  type="number"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Top Level Category</InputLabel>
                  <Select
                    name="topLevelCategory"
                    value={productData.topLevelCategory}
                    onChange={handleChange}
                    label="Top Level Category"
                  >
                    <MenuItem value="men">Men</MenuItem>
                    <MenuItem value="women">Women</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Second Level Category</InputLabel>
                  <Select
                    name="secondLevelCategory"
                    value={productData.secondLevelCategory}
                    onChange={handleChange}
                    label="Second Level Category"
                  >
                    <MenuItem value="shoes">Shoes</MenuItem>
                    <MenuItem value="clothing">Clothing</MenuItem>
                    <MenuItem value="accessories">Accessories</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Third Level Category</InputLabel>
                  <Select
                    name="thirdLevelCategory"
                    value={productData.thirdLevelCategory}
                    onChange={handleChange}
                    label="Third Level Category"
                  >
                    {thirdLevelCategoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  name="description"
                  rows={3}
                  onChange={handleChange}
                  value={productData.description}
                />
              </Grid>
              {productData.size.map((size, index) => (
                <Fragment key={index}>
                  <Grid container item spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Size Name"
                        name="name"
                        value={size.name}
                        onChange={(event) => handleSizeChange(event, index)}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Quantity"
                        name="size_quantity"
                        type="number"
                        onChange={(event) => handleSizeChange(event, index)}
                        required
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Fragment>
              ))}
              <Grid item cs={12}>
                <Button
                  variant="contained"
                  sx={{ p: 1.8 }}
                  className="py-20"
                  size="large"
                  type="submit"
                >
                  Add New Product
                </Button>
              </Grid>
            </Grid>
          </Fragment>
        </form>
      )}
    </div>
  );
};

export default CreateProductForm;
