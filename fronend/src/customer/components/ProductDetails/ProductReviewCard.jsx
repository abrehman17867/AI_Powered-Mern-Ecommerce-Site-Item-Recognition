import { Avatar, Box, Grid, Rating } from "@mui/material";
import React from "react";

const ProductReviewCard = ({ review,rating }) => {
  return (
    <div>
      <Grid container spacing={2} gap={3}>
        <Grid item xs={1}>
          <Box>
            <Avatar className='text-white' sx= {{width:56,height:56,bgcolor:"#9155fd"}}>
              {review.user.firstName.charAt(0)}{review.user.lastName.charAt(0)}
            </Avatar>
          </Box>
        </Grid>

        <Grid item xs={9}>
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-lg">{review?.user?.firstName.charAt(0)}{review?.user?.lastName.charAt(0)}</p>
              <p className="opacity-70">{new Date(review.createAt).toLocaleDateString()}</p>
            </div>
          </div>
          <Rating value={rating} name="half-rating" readOnly precision={0.5}/>
          <p>{review.review}</p>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProductReviewCard;
