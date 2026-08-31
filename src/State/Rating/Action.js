import {
  CREATE_RATING_REQUEST,
  CREATE_RATING_SUCCESS,
  CREATE_RATING_FAILURE,
  FETCH_RATINGS_REQUEST,
  FETCH_RATINGS_SUCCESS,
  FETCH_RATINGS_FAILURE,
} from './ActionType';
import { api } from '../../config/apiConfig';

export const createRating = (rating) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_RATING_REQUEST });
    const { data } = await api.post('/api/ratings/create', rating);
    dispatch({ type: CREATE_RATING_SUCCESS, payload: data });
    console.log("Created Rating: ", data);
  } catch (error) {
    dispatch({ type: CREATE_RATING_FAILURE, payload: error.message });
  }
};

export const fetchRatings = (productId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_RATINGS_REQUEST });
    const { data } = await api.put(`/api/ratings/product/${productId}`);
    dispatch({ type: FETCH_RATINGS_SUCCESS, payload: data });
    console.log("Ratings: ", data);
  } catch (error) {
    dispatch({ type: FETCH_RATINGS_FAILURE, payload: error.message });
  }
};
