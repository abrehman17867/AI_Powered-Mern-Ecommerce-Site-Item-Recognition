import {
  ADD_ITEM_TO_CART_FAILURE,
  ADD_ITEM_TO_CART_REQUEST,
  ADD_ITEM_TO_CART_SUCCESS,
  GET_CART_FAILURE,
  GET_CART_REQUEST,
  GET_CART_SUCCESS,
  REMOVE_CART_ITEM_FAILURE,
  REMOVE_CART_ITEM_REQUEST,
  REMOVE_CART_ITEM_SUCCESS,
  UPDATE_CART_ITEM_FAILURE,
  UPDATE_CART_ITEM_REQUEST,
  UPDATE_CART_ITEM_SUCCESS,
} from "./ActionType";

const initialState = {
  cart: {
    cartItems: [],
    totalPrice: 0,
    totalDiscountedPrice: 0,
    discounte: 0,
  },
  loading: false,
  addingItem: false,
  updatingItemId: null,
  error: null,
};

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ITEM_TO_CART_REQUEST:
      return { ...state, loading: true, addingItem: true, error: null };
    case ADD_ITEM_TO_CART_SUCCESS:
      return {
        ...state,
        loading: false,
        addingItem: false,
        error: null,
      };
    case ADD_ITEM_TO_CART_FAILURE:
      return { ...state, loading: false, addingItem: false, error: action.payload };

    case GET_CART_REQUEST:
      return {
        ...state,
        loading: action.meta?.silent ? state.loading : true,
        error: action.meta?.silent ? state.error : null,
      };
    case GET_CART_SUCCESS:
      return {
        ...state,
        cart: action.payload,
        loading: false,
        updatingItemId: null,
        error: null,
      };
    case GET_CART_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
        updatingItemId: null,
      };

    case UPDATE_CART_ITEM_REQUEST:
    case REMOVE_CART_ITEM_REQUEST:
      return {
        ...state,
        updatingItemId: action.payload,
        error: null,
      };

    case REMOVE_CART_ITEM_SUCCESS:
      return {
        ...state,
        updatingItemId: null,
      };

    case UPDATE_CART_ITEM_SUCCESS:
      return {
        ...state,
        updatingItemId: null,
      };

    case REMOVE_CART_ITEM_FAILURE:
    case UPDATE_CART_ITEM_FAILURE:
      return {
        ...state,
        error: action.payload,
        updatingItemId: null,
      };

    default:
      return state;
  }
};
