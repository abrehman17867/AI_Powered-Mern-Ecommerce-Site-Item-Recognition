import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createRating } from "../../../State/Rating/Action";
import { createReview } from "../../../State/Review/Action";
import Button from "../../../components/ui/Button";
import { StarIcon } from "@heroicons/react/24/solid";
import { classNames } from "../../../utils/classNames";

export default function RatingsReviewForm({ productId, showTitle = true, className }) {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !review.trim()) return;
    setSubmitting(true);
    try {
      await dispatch(createRating({ productId, rating }));
      await dispatch(createReview({ productId, review: review.trim() }));
      setRating(0);
      setReview("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={classNames("space-y-5", className)}>
      {showTitle ? (
        <div>
          <h3 className="text-lg font-semibold text-foreground">Write a review</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Share your experience with this product.
          </p>
        </div>
      ) : null}

      <div>
        <p className="text-sm font-medium text-foreground">Your rating</p>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="rounded p-0.5 transition hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <StarIcon
                className={classNames(
                  "h-7 w-7",
                  star <= (hover || rating) ? "text-amber-400" : "text-zinc-200"
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-foreground-muted">
            {rating ? `${rating} / 5` : "Select stars"}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="product-review" className="text-sm font-medium text-foreground">
          Your review
        </label>
        <textarea
          id="product-review"
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="What did you like or dislike?"
          className="ui-input mt-2 min-h-[120px] resize-y"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={submitting || !rating || !review.trim()}
        className="w-full sm:w-auto"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
