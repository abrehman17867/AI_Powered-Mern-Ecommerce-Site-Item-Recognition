import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createRating } from "../../../State/Rating/Action";
import { createReview } from "../../../State/Review/Action";
import { Box, Button, TextField, Typography } from "@mui/material";
import Spinner from "../../components/Spinner/Spinner";

const RatingsReviewsPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const ratingState = useSelector((state) => state.ratings);
  const reviewState = useSelector((state) => state.reviews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  const handleRatingChange = (event) => {
    setRating(event.target.value);
  };

  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  const handleSubmit = () => {
    setLoading(true);

    // Dispatch both rating and review creation actions
    dispatch(createRating({ productId, rating }));
    dispatch(createReview({ productId, review }));

    // Reset the form fields after submission
    setRating(0);
    setReview("");
    setLoading(false);
  };

  return (
    <div>
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <div className="container mx-auto py-8">
          <Typography variant="h4" gutterBottom>
            Rate & Review Product
          </Typography>
          <Box sx={{ mb: 4 }}>
            <TextField
              id="rating"
              label="Rating (1-5)"
              type="number"
              InputProps={{ inputProps: { min: 1, max: 5 } }}
              variant="outlined"
              fullWidth
              value={rating}
              onChange={handleRatingChange}
            />
          </Box>
          <Box sx={{ mb: 4 }}>
            <TextField
              id="review"
              label="Review"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={review}
              onChange={handleReviewChange}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            type="submit"
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default RatingsReviewsPage;
