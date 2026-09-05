"use client";

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
  SET_CART_ITEM_QUANTITY_OPTIMISTIC,
  UPDATE_CART_ITEM_FAILURE,
  UPDATE_CART_ITEM_REQUEST,
  UPDATE_CART_ITEM_SUCCESS,
} from "./ActionType";
import { api } from "../../config/apiConfig";

const emptyCartPayload = () => ({
  cartItems: [],
  totalPrice: 0,
  totalDiscountedPrice: 0,
  discounte: 0,
  totalItem: 0,
});

function normalizeCartPayload(data) {
  if (!data || typeof data !== "object") {
    return emptyCartPayload();
  }
  return {
    _id: data._id,
    user: data.user,
    cartItems: Array.isArray(data.cartItems) ? data.cartItems : [],
    totalPrice: Number(data.totalPrice) || 0,
    totalDiscountedPrice: Number(data.totalDiscountedPrice) || 0,
    discounte: Number(data.discounte) || 0,
    totalItem: Number(data.totalItem) || 0,
  };
}

const errorMessage = (error, fallback) =>
  error.response?.data?.error || error.message || fallback;

export const getCart = (options = {}) => async (dispatch, getState) => {
  const silent = options.silent === true;
  // Snapshot the cart version now; if a mutation lands while this read is in
  // flight the reducer will discard the stale result.
  const version = getState().cart.version;
  dispatch({ type: GET_CART_REQUEST, meta: { silent } });

  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    dispatch({ type: GET_CART_SUCCESS, payload: emptyCartPayload(), meta: { version } });
    return;
  }

  try {
    const { data } = await api.get("/api/cart/");
    dispatch({
      type: GET_CART_SUCCESS,
      payload: normalizeCartPayload(data),
      meta: { version },
    });
  } catch (error) {
    dispatch({ type: GET_CART_FAILURE, payload: errorMessage(error, "Could not load cart") });
  }
};

export const addItemToCart = (reqData) => async (dispatch, getState) => {
  if (getState().cart.addingItem) return;

  dispatch({ type: ADD_ITEM_TO_CART_REQUEST, payload: reqData.productId });

  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    const message = "Please sign in to add items to your cart.";
    dispatch({ type: ADD_ITEM_TO_CART_FAILURE, payload: message });
    throw new Error(message);
  }

  const quantity = Math.max(1, parseInt(reqData.quantity, 10) || 1);

  try {
    // The endpoint returns the refreshed cart, so no follow-up GET is needed.
    const { data } = await api.put("/api/cart/add", { ...reqData, quantity });
    dispatch({ type: ADD_ITEM_TO_CART_SUCCESS, payload: normalizeCartPayload(data) });
  } catch (error) {
    const message = errorMessage(error, "Could not add to cart");
    dispatch({ type: ADD_ITEM_TO_CART_FAILURE, payload: message });
    throw new Error(message);
  }
};

export const removeCartItem = (cartItemId) => async (dispatch) => {
  dispatch({ type: REMOVE_CART_ITEM_REQUEST, payload: cartItemId });

  try {
    const { data } = await api.delete(`/api/cart_items/${cartItemId}`);
    dispatch({
      type: REMOVE_CART_ITEM_SUCCESS,
      payload: { cartItemId, cart: normalizeCartPayload(data) },
    });
  } catch (error) {
    dispatch({
      type: REMOVE_CART_ITEM_FAILURE,
      payload: { cartItemId, message: errorMessage(error, "Could not remove item") },
    });
    // Pull the authoritative cart back so the row does not stay in a
    // half-removed state.
    dispatch(getCart({ silent: true }));
  }
};

/** Applied instantly on tap; the network call follows, debounced by the caller. */
export const setCartItemQuantityOptimistic = (cartItemId, quantity) => ({
  type: SET_CART_ITEM_QUANTITY_OPTIMISTIC,
  payload: { cartItemId, quantity },
});

export const updateCartItem = (reqData) => async (dispatch) => {
  const cartItemId = reqData.cartItemId;
  dispatch({ type: UPDATE_CART_ITEM_REQUEST, payload: cartItemId });

  try {
    const { data } = await api.put(`/api/cart_items/${cartItemId}`, reqData.data);
    dispatch({
      type: UPDATE_CART_ITEM_SUCCESS,
      payload: { cartItemId, cart: normalizeCartPayload(data) },
    });
  } catch (error) {
    dispatch({
      type: UPDATE_CART_ITEM_FAILURE,
      payload: { cartItemId, message: errorMessage(error, "Could not update quantity") },
    });
    // The optimistic quantity is now wrong; take the server's word for it.
    dispatch(getCart({ silent: true }));
  }
};
