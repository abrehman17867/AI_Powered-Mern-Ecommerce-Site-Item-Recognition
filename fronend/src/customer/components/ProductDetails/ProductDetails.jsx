import { useEffect, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { Box, Button, Grid, LinearProgress, Rating } from "@mui/material";
import ProductReviewCard from "./ProductReviewCard";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { findProductsById } from "../../../State/Product/Action";
import { addItemToCart } from "../../../State/Cart/Action";
import { Snackbar, Alert } from "@mui/material";
import { findReviews } from "../../../State/Review/Action";
import { fetchRatings } from "../../../State/Rating/Action";
import RatingsReviewsPage from "../../pages/Ratings and Reviews/RatingsReviewsPage";
import Spinner from "../../components/Spinner/Spinner";

const product = {
  name: "Basic Sneaker 6-Pack",
  price: "$192",
  href: "#",
  breadcrumbs: [
    { id: 1, name: "Men", href: "#" },
    { id: 2, name: "Shoes", href: "#" },
  ],
  images: [
    {
      src: "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U2hvcHBpbmclMjBjYXJ0fGVufDB8fDB8fHww",
      alt: "Two each of gray, white, and black shirts laying flat.",
    },
    {
      src: "https://media.istockphoto.com/id/1560142923/photo/online-shopping-modern-background-glowing-shopping-cart-icon-web3-colours-cgi-3d-render.webp?b=1&s=170667a&w=0&k=20&c=x7iGKzSmVp0IypV04FxWFeo5VSkySkDiqPMnMSO66Vg=",
      alt: "Model wearing plain black basic tee.",
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1684785617085-3a875d81920f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZWNvbW1lcmNlfGVufDB8fDB8fHww",
      alt: "Model wearing plain gray basic tee.",
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1683288662040-5ca51d0880b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGVjb21tZXJjZXxlbnwwfHwwfHx8MA%3D%3D",
      alt: "Model wearing plain white basic tee.",
    },
  ],
  colors: [
    { name: "White", class: "bg-white", selectedClass: "ring-gray-400" },
    { name: "Gray", class: "bg-gray-200", selectedClass: "ring-gray-400" },
    { name: "Black", class: "bg-gray-900", selectedClass: "ring-gray-900" },
  ],
  sizes: [
    { name: "S", inStock: true },
    { name: "M", inStock: true },
    { name: "L", inStock: true },
  ],
  description:
    'The Basic Sneaker 6-Pack allows you to fully express your vibrant personality with three versatile options. Feeling adventurous? Put on a sleek black sneaker. Want to be a trendsetter? Try our exclusive colorway: "Red". Need to add an extra pop of color to your outfit? Our white sneaker has you covered.',
  highlights: [
    "Handcrafted for premium quality",
    "Available in a range of sizes",
    "Durable construction for long-lasting wear",
    "Comfortable fit for all-day use",
  ],
  details:
    'The 6-Pack includes two black, two white, and two gray Basic Sneakers. Sign up for our subscription service and be the first to get new, exciting colors, like our upcoming "Navy Blue" limited release.',
};
const reviews = { href: "#", average: 4, totalCount: 117 };

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState("");
  const navigate = useNavigate();
  const params = useParams();
  const { products } = useSelector((store) => store);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { productId } = useParams();
  const dispatch = useDispatch();
  const { reviews, ratings } = useSelector((store) => store);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  console.log("Reviews: ", reviews);
  console.log("Ratings: ", ratings);
  console.log("--------", ratings?.ratings?.rating);

  useEffect(() => {
    dispatch(findReviews(productId));
    dispatch(fetchRatings(productId));
  }, [dispatch, productId]);

  //console.log("Product ID from params: ", params.productId);

  const handleAddToCart = () => {
    // Check if a size is selected
    if (!selectedSize) {
      // If no size is selected, set the snackbar message and open the snackbar
      setSnackbarMessage("Please select a size before adding to cart.");
      setSnackbarOpen(true);
      return;
    }

    // If a size is selected, proceed to add the item to the cart
    const data = { productId: params.productId, size: selectedSize.name };
    console.log("Data------- ", data);
    dispatch(addItemToCart(data));
    navigate("/cart");
  };

  useEffect(() => {
    const data = { productId: params.productId };
    dispatch(findProductsById({ data }));
  }, [params.productId]);

  const findRating = (userId) => {
    const foundRating = ratings?.ratings?.find(
      (rating) => rating?.user?._id === userId
    );
    return foundRating ? foundRating.rating : null;
  };

  return (
    <div className="bg-white lg:px-20">
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <div className="pt-6">
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity="warning"
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
          <nav aria-label="Breadcrumb">
            <ol
              role="list"
              className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8"
            >
              {product.breadcrumbs.map((breadcrumb) => (
                <li key={breadcrumb.id}>
                  <div className="flex items-center">
                    <a
                      href={breadcrumb.href}
                      className="mr-2 text-sm font-medium text-gray-900"
                    >
                      {breadcrumb.name}
                    </a>
                    <svg
                      width={16}
                      height={20}
                      viewBox="0 0 16 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-5 w-4 text-gray-300"
                    >
                      <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                    </svg>
                  </div>
                </li>
              ))}
              <li className="text-sm">
                <a
                  href={product.href}
                  aria-current="page"
                  className="font-medium text-gray-500 hover:text-gray-600"
                >
                  {products?.product?.category?.name}
                </a>
              </li>
            </ol>
          </nav>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10 px-4 pt-10">
            {/* Image gallery */}
            <div className="flex flex-col items-center">
              <div className="overflow-hidden rounded-lg max-w-[30rem] max-h-[30rem]">
                <img
                  src={products.product?.imageUrl}
                  alt=""
                  className="h-full w-full object-cover object-center "
                />
              </div>
              <div className="flex flex-wrap space-x-5 justify-center">
                {product.images.map((item) => (
                  <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg max-w-[5rem] max-h-[5rem] mt-4">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Product info */}
            <div className="lg:col-span-1 maxt-auto max-w-2xl px-4 pb-16 sm:px-6 lg:max-w-7xl lg:px-8">
              <div className="lg:col-span-2 ">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {products.product?.brand}
                </h1>

                <h1 className="text-lg lg:text-xl text-gray-900 opacity-60 pt-2">
                  {products.product?.title}
                </h1>
              </div>

              {/* Options */}
              <div className="mt-4 lg:row-span-3 lg:mt-0">
                <h2 className="sr-only">Product information</h2>
                <div className="flex space-x-5 items-center text-lg lg:text-xl text-gray-900 mt-6">
                  <p className="font-semibold">
                    ${products.product?.discountedPrice}
                  </p>
                  <p className="opacity-50 line-through">
                    ${products.product?.price}
                  </p>
                  <p className="text-green-600 font-semibold">
                    %{products.product?.discountedPersent}
                  </p>
                </div>

                {/* Reviews */}
                <div className="mt-6">
                  <div className="flex items-center space-x-3">
                    <Rating name="read-only" value={5.5} readOnly />
                    <p className="opacity-50 text-sm">4056 Ratings</p>
                    <p className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      2143 Reviews
                    </p>
                  </div>
                </div>

                <form className="mt-10">
                  {/* Sizes */}
                  <div className="mt-10">
                    <div className="flex items-center justify-between">
                      <h1
                        className=" font-medium text-gray-700"
                        style={{ fontSize: "16px" }}
                      >
                        Size
                      </h1>
                    </div>

                    <RadioGroup
                      value={selectedSize}
                      onChange={setSelectedSize}
                      className="mt-3 mb-3"
                    >
                      <RadioGroup.Label className="sr-only">
                        Choose a size
                      </RadioGroup.Label>
                      <div
                        className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4"
                        style={{ maxHeight: "40%", maxWidth: "80%" }}
                      >
                        {product.sizes.map((size) => (
                          <RadioGroup.Option
                            key={size.name}
                            value={size}
                            disabled={!size.inStock}
                            className={({ active }) =>
                              classNames(
                                size.inStock
                                  ? "cursor-pointer bg-white text-gray-900 shadow-sm"
                                  : "cursor-not-allowed bg-gray-50 text-gray-200",
                                active ? "ring-2 ring-indigo-500" : "",
                                "group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 sm:py-6"
                              )
                            }
                          >
                            {({ active, checked }) => (
                              <>
                                <RadioGroup.Label as="span">
                                  {size.name}
                                </RadioGroup.Label>
                                {size.inStock ? (
                                  <span
                                    className={classNames(
                                      active ? "border" : "border-2",
                                      checked
                                        ? "border-indigo-500"
                                        : "border-transparent",
                                      "pointer-events-none absolute -inset-px rounded-md"
                                    )}
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                                  >
                                    <svg
                                      className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                                      viewBox="0 0 100 100"
                                      preserveAspectRatio="none"
                                      stroke="currentColor"
                                    >
                                      <line
                                        x1={0}
                                        y1={100}
                                        x2={100}
                                        y2={0}
                                        vectorEffect="non-scaling-stroke"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    variant="contained"
                    sx={{ px: "1.8rem", py: "0.7rem", bgcolor: "#9155fd" }}
                  >
                    Add To Cart
                  </Button>
                </form>
              </div>

              <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
                {/* Description and details */}
                <div>
                  <h3 className=" sr-only">Description</h3>

                  <div className="space-y-6">
                    <p className="text-base text-gray-900">
                      {products?.product?.description}
                    </p>
                  </div>
                </div>

                <div className="mt-10">
                  <h3 className="text-sm font-medium text-gray-900">
                    Highlights
                  </h3>

                  <div className="mt-4">
                    <ul
                      role="list"
                      className="list-disc space-y-2 pl-4 text-sm"
                    >
                      {product.highlights.map((highlight) => (
                        <li key={highlight} className="text-gray-400">
                          <span className="text-gray-600">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10">
                  <h2 className="text-sm font-medium text-gray-900">Details</h2>

                  <div className="mt-4 space-y-6">
                    <p className="text-sm text-gray-600">{product.details}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Add rating and reviews */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10 px-4 pt-10">
            <RatingsReviewsPage />
          </section>

          {/* recent rating and reviews */}
          <section className="font-semibold text-sm pb-4 ">
            <h1 className="font-bold text-xl py-4 ">Recent Review & Rating</h1>

            <div className="border p-5 flex flex-col items-center justify-center">
              <Grid container spacing={9}>
                <Grid item xs={7}>
                  <div className="space-y-5">
                    {reviews?.reviews?.map((review, index) => (
                      <ProductReviewCard
                        key={index}
                        review={review}
                        rating={findRating(review.user._id)}
                      />
                    ))}
                  </div>
                </Grid>
                <Grid item xs={5}>
                  <h1 className="text-xl font-semibold pb-2">
                    Product Ratings
                  </h1>
                  <div className="flex items-center space-x-3">
                    <Rating
                      value={ratings?.totalRating}
                      precision={0.5}
                      readOnly
                    />
                    <p className="opacity-50">{ratings?.totalRating} Ratings</p>
                  </div>
                  {/* <Box className="mt-5 space-y-5">
                  <Grid container alignItems="center" gap={2}>
                    <Grid item xs={2}>
                      <p>Excellent</p>
                    </Grid>
                    <Grid item xs={7}>
                      <LinearProgress
                        sx={{ bgcolor: "#d0d0d0", borderRadius: 4, height: 7 }}
                        variant="determinate"
                        value={40}
                        color="success"
                      />
                    </Grid>
                  </Grid>
                  <Grid container alignItems="center" gap={2}>
                    <Grid item xs={2}>
                      <p>Very Good</p>
                    </Grid>
                    <Grid item xs={7}>
                      <LinearProgress
                        sx={{ bgcolor: "#d0d0d0", borderRadius: 4, height: 7 }}
                        variant="determinate"
                        value={30}
                        color="secondary"
                      />
                    </Grid>
                  </Grid>
                  <Grid container alignItems="center" gap={2}>
                    <Grid item xs={2}>
                      <p>Good</p>
                    </Grid>
                    <Grid item xs={7}>
                      <LinearProgress
                        sx={{ bgcolor: "#d0d0d0", borderRadius: 4, height: 7 }}
                        variant="determinate"
                        value={29}
                      />
                    </Grid>
                  </Grid>
                  <Grid container alignItems="center" gap={2}>
                    <Grid item xs={2}>
                      <p>Average</p>
                    </Grid>
                    <Grid item xs={7}>
                      <LinearProgress
                        sx={{ bgcolor: "#d0d0d0", borderRadius: 4, height: 7 }}
                        variant="determinate"
                        value={22}
                        color="warning"
                      />
                    </Grid>
                  </Grid>
                  <Grid container alignItems="center" gap={2}>
                    <Grid item xs={2}>
                      <p>Poor</p>
                    </Grid>
                    <Grid item xs={7}>
                      <LinearProgress
                        sx={{ bgcolor: "#d0d0d0", borderRadius: 4, height: 7 }}
                        variant="determinate"
                        value={17}
                        color="error"
                      />
                    </Grid>
                  </Grid>
                </Box> */}
                  <Box className="mt-5 space-y-5">
                    <Grid container alignItems="center" gap={2}>
                      <Grid item xs={2}>
                        <p>Excellent</p>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          sx={{
                            bgcolor: "#d0d0d0",
                            borderRadius: 4,
                            height: 7,
                          }}
                          variant="determinate"
                          value={ratings.totalRating * 10}
                          color="success"
                        />
                      </Grid>
                    </Grid>
                    <Grid container alignItems="center" gap={2}>
                      <Grid item xs={2}>
                        <p>Very Good</p>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          sx={{
                            bgcolor: "#d0d0d0",
                            borderRadius: 4,
                            height: 7,
                          }}
                          variant="determinate"
                          value={(ratings.totalRating - 1) * 10}
                          color="secondary"
                        />
                      </Grid>
                    </Grid>
                    <Grid container alignItems="center" gap={2}>
                      <Grid item xs={2}>
                        <p>Good</p>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          sx={{
                            bgcolor: "#d0d0d0",
                            borderRadius: 4,
                            height: 7,
                          }}
                          variant="determinate"
                          value={(ratings.totalRating - 2) * 10}
                        />
                      </Grid>
                    </Grid>
                    <Grid container alignItems="center" gap={2}>
                      <Grid item xs={2}>
                        <p>Average</p>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          sx={{
                            bgcolor: "#d0d0d0",
                            borderRadius: 4,
                            height: 7,
                          }}
                          variant="determinate"
                          value={(ratings.totalRating - 3) * 10}
                          color="warning"
                        />
                      </Grid>
                    </Grid>
                    <Grid container alignItems="center" gap={2}>
                      <Grid item xs={2}>
                        <p>Poor</p>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          sx={{
                            bgcolor: "#d0d0d0",
                            borderRadius: 4,
                            height: 7,
                          }}
                          variant="determinate"
                          value={(ratings.totalRating - 4) * 10}
                          color="error"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </div>
          </section>

          {/* similar products */}
          {/* <section className="pt-10">
            <h1 className="py-5 text-xl font-bold">Similar Products</h1>
            <div className="space-y-5">
              <HomeSectionCard data={shoes_data} />
              <HomeSectionCard data={shoes_data} />
              <HomeSectionCard data={shoes_data} />
            </div>
          </section> */}
        </div>
      )}
    </div>
  );
}
