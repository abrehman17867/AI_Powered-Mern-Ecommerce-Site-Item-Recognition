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

export const getCart = (options = {}) => async (dispatch) => {
  const silent = options.silent === true;
  dispatch({ type: GET_CART_REQUEST, meta: { silent } });

  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    dispatch({ type: GET_CART_SUCCESS, payload: emptyCartPayload() });
    return;
  }

  try {
    const { data } = await api.get("/api/cart/");
    dispatch({ type: GET_CART_SUCCESS, payload: normalizeCartPayload(data) });
  } catch (error) {
    const message =
      error.response?.data?.error || error.message || "Could not load cart";
    console.error("Error fetching cart data:", error);
    dispatch({ type: GET_CART_FAILURE, payload: message });
  }
};

export const addItemToCart = (reqData) => async (dispatch, getState) => {
  if (getState().cart.addingItem) {
    return;
  }

  dispatch({ type: ADD_ITEM_TO_CART_REQUEST });

  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    const message = "Please sign in to add items to your cart.";
    dispatch({ type: ADD_ITEM_TO_CART_FAILURE, payload: message });
    throw new Error(message);
  }

  const quantity = Math.max(1, parseInt(reqData.quantity, 10) || 1);

  try {
    await api.put("/api/cart/add", { ...reqData, quantity });
    dispatch({ type: ADD_ITEM_TO_CART_SUCCESS });
    await dispatch(getCart({ silent: true }));
  } catch (error) {
    const message =
      error.response?.data?.error || error.message || "Could not add to cart";
    dispatch({ type: ADD_ITEM_TO_CART_FAILURE, payload: message });
    throw new Error(message);
  }
};

export const removeCartItem = (cartItemId) => async (dispatch) => {
  dispatch({ type: REMOVE_CART_ITEM_REQUEST, payload: cartItemId });

  try {
    await api.delete(`/api/cart_items/${cartItemId}`);
    dispatch({ type: REMOVE_CART_ITEM_SUCCESS, payload: cartItemId });
    await dispatch(getCart({ silent: true }));
  } catch (error) {
    dispatch({
      type: REMOVE_CART_ITEM_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
  }
};

export const updateCartItem = (reqData) => async (dispatch) => {
  dispatch({ type: UPDATE_CART_ITEM_REQUEST, payload: reqData.cartItemId });

  try {
    await api.put(`/api/cart_items/${reqData.cartItemId}`, reqData.data);
    dispatch({ type: UPDATE_CART_ITEM_SUCCESS, payload: reqData.cartItemId });
    await dispatch(getCart({ silent: true }));
  } catch (error) {
    dispatch({
      type: UPDATE_CART_ITEM_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
  }
};
