import { api } from "../../../config/apiConfig";
import {
  CANCELLED_ORDER_FAILURE,
  CANCELLED_ORDER_REQUEST,
  CANCELLED_ORDER_SUCCESS,
  CONFIRMED_ORDER_FAILURE,
  CONFIRMED_ORDER_REQUEST,
  CONFIRMED_ORDER_SUCCESS,
  DELETE_ORDER_FAILURE,
  DELETE_ORDER_REQUEST,
  DELETE_ORDER_SUCCESS,
  DELIVERED_ORDER_FAILURE,
  DELIVERED_ORDER_REQUEST,
  DELIVERED_ORDER_SUCCESS,
  GET_ORDERS_FAILURE,
  GET_ORDERS_REQUEST,
  GET_ORDERS_SUCCESS,
  SHIP_ORDER_FAILURE,
  SHIP_ORDER_REQUEST,
  SHIP_ORDER_SUCCESS,
} from "./ActionType";

const errorMessage = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong.";

export const getOrders = () => async (dispatch) => {
  dispatch({ type: GET_ORDERS_REQUEST });
  try {
    const { data } = await api.get(`/api/admin/orders/`);
    dispatch({ type: GET_ORDERS_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: GET_ORDERS_FAILURE, payload: errorMessage(error) });
    throw error;
  }
};

/**
 * All four status transitions share one shape: the request carries the order id
 * so the reducer can mark just that row busy, and the success carries the
 * updated order so the row can be patched in place without a refetch.
 */
const statusAction =
  ({ request, success, failure, path }) =>
  (orderId) =>
  async (dispatch) => {
    dispatch({ type: request, payload: orderId });
    try {
      const { data } = await api.put(`/api/admin/orders/${orderId}/${path}`);
      dispatch({ type: success, payload: data });
      return data;
    } catch (error) {
      dispatch({ type: failure, payload: errorMessage(error) });
      throw error;
    }
  };

export const confirmOrder = statusAction({
  request: CONFIRMED_ORDER_REQUEST,
  success: CONFIRMED_ORDER_SUCCESS,
  failure: CONFIRMED_ORDER_FAILURE,
  path: "confirmed",
});

export const shipOrder = statusAction({
  request: SHIP_ORDER_REQUEST,
  success: SHIP_ORDER_SUCCESS,
  failure: SHIP_ORDER_FAILURE,
  path: "ship",
});

export const deliveredOrder = statusAction({
  request: DELIVERED_ORDER_REQUEST,
  success: DELIVERED_ORDER_SUCCESS,
  failure: DELIVERED_ORDER_FAILURE,
  path: "deliver",
});

export const cancelOrder = statusAction({
  request: CANCELLED_ORDER_REQUEST,
  success: CANCELLED_ORDER_SUCCESS,
  failure: CANCELLED_ORDER_FAILURE,
  path: "cancel",
});

export const deleteOrder = (orderId) => async (dispatch) => {
  dispatch({ type: DELETE_ORDER_REQUEST, payload: orderId });
  try {
    await api.put(`/api/admin/orders/${orderId}/delete`);
    // The endpoint replies 200 with an empty body, so the id has to come from
    // here for the reducer to know which row to drop.
    dispatch({ type: DELETE_ORDER_SUCCESS, payload: orderId });
    return orderId;
  } catch (error) {
    dispatch({ type: DELETE_ORDER_FAILURE, payload: errorMessage(error) });
    throw error;
  }
};
