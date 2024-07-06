
import {
  CREATE_RATING_REQUEST,
  CREATE_RATING_SUCCESS,
  CREATE_RATING_FAILURE,
  FETCH_RATINGS_REQUEST,
  FETCH_RATINGS_SUCCESS,
  FETCH_RATINGS_FAILURE,
} from './ActionType';

const initialState = {
  ratings: [],
  rating: null,
  loading: false,
  error: null,
  message: null,
  totalRating: 0,
};

export const ratingReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_RATING_REQUEST:
    case FETCH_RATINGS_REQUEST:
      return { ...state, loading: true, error: null, message: null };
    case CREATE_RATING_SUCCESS:
      return { ...state, loading: false, rating: action.payload.rating, error: null, message: action.payload.message };
    case FETCH_RATINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        ratings: action.payload.ratings,
        totalRating: action.payload.totalRating,
        error: null,
        message: action.payload.message || null,
      };
    case CREATE_RATING_FAILURE:
    case FETCH_RATINGS_FAILURE:
      return { ...state, loading: false, error: action.payload, message: null };
    default:
      return state;
  }
};
