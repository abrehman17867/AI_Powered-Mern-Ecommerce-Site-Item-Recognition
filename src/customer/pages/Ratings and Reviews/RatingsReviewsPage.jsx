"use client";

import React from "react";
import { useParams } from "@/lib/navigation";
import RatingsReviewForm from "./RatingsReviewForm";

const RatingsReviewsPage = () => {
  const { productId } = useParams();

  return (
    <div>
      <RatingsReviewForm productId={productId} showTitle />
    </div>
  );
};

export default RatingsReviewsPage;
