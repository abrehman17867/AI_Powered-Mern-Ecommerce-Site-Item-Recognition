import {
  CREATE_REVIEW_REQUEST,
  CREATE_REVIEW_SUCCESS,
  CREATE_REVIEW_FAILURE,
  FIND_REVIEWS_REQUEST,
  FIND_REVIEWS_SUCCESS,
  FIND_REVIEWS_FAILURE,
} from './ActionType';

const initialState = {
  reviews: [],
  review: null,
  loading: false,
  error: null,
  message: null,
};

export const reviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_REVIEW_REQUEST:
    case FIND_REVIEWS_REQUEST:
      return { ...state, loading: true, error: null, message: null };
    case CREATE_REVIEW_SUCCESS:
      return { ...state, loading: false, review: action.payload, error: null, message: null };
    case FIND_REVIEWS_SUCCESS:
      return { ...state, loading: false, reviews: action.payload.reviews || [], error: null, message: action.payload.message || null };
    case CREATE_REVIEW_FAILURE:
    case FIND_REVIEWS_FAILURE:
      return { ...state, loading: false, error: action.payload, review: null, reviews: [], message: null };
    default:
      return state;
  }
};
