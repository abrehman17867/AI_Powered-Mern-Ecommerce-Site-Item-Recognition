import {
    CREATE_REVIEW_REQUEST,
    CREATE_REVIEW_SUCCESS,
    CREATE_REVIEW_FAILURE,
    FIND_REVIEWS_REQUEST,
    FIND_REVIEWS_SUCCESS,
    FIND_REVIEWS_FAILURE,
  } from './ActionType';
  import { api } from '../../config/apiConfig';
  
  export const createReview = (review) => async (dispatch) => {
    try {
      dispatch({ type: CREATE_REVIEW_REQUEST });
      const { data } = await api.post(`/api/reviews/create`, review);
      dispatch({ type: CREATE_REVIEW_SUCCESS, payload: data });
      console.log("Created Review: ", data);
    } catch (error) {
      dispatch({ type: CREATE_REVIEW_FAILURE, payload: error.message });
    }
  };
  
  export const findReviews = (productId) => async (dispatch) => {
    try {
      dispatch({ type: FIND_REVIEWS_REQUEST });
      const { data } = await api.get(`/api/reviews/product/${productId}`);
      if (data.length === 0) {
        dispatch({ type: FIND_REVIEWS_SUCCESS, payload: { message: "This product has no reviews yet." } });
      } else {
        dispatch({ type: FIND_REVIEWS_SUCCESS, payload: data });
      }
      console.log("Reviews: ", data);
    } catch (error) {
      dispatch({ type: FIND_REVIEWS_FAILURE, payload: error.message });
    }
  };
  