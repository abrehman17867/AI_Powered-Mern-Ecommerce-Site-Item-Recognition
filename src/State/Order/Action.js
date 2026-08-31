import {
  CREATE_ORDER_FAILURE,
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  GET_ORDER_BY_ID_FAILURE,
  GET_ORDER_BY_ID_REQUEST,
  GET_ORDER_BY_ID_SUCCESS,
  GET_ORDER_HISTORY_FAILURE,
  GET_ORDER_HISTORY_REQUEST,
  GET_ORDER_HISTORY_SUCCESS,
} from "./ActionType";
import { api } from "../../config/apiConfig";
import { getCart } from "../Cart/Action";

export const createOrder = (reqData) => async (dispatch) => {
  dispatch({ type: CREATE_ORDER_REQUEST });
  try {
    const { data } = await api.post("/api/orders/", reqData.address);
    dispatch({
      type: CREATE_ORDER_SUCCESS,
      payload: data,
    });
    await dispatch(getCart({ silent: true }));
    if (data._id) {
      reqData.navigate(`/checkout?step=3&order_id=${data._id}`);
    }
  } catch (error) {
    dispatch({
      type: CREATE_ORDER_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const getOrderById = (orderId, options = {}) => async (dispatch, getState) => {
  const silent =
    options.silent ??
    (getState().order.order?._id === orderId && Boolean(getState().order.order));
  dispatch({ type: GET_ORDER_BY_ID_REQUEST, meta: { silent } });
  try {
    const { data } = await api.get(`/api/orders/${orderId}`);
    dispatch({
      type: GET_ORDER_BY_ID_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_ORDER_BY_ID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const getOrderHistory = (options = {}) => async (dispatch, getState) => {
  const silent = options.silent ?? (getState().order.orders?.length > 0);
  dispatch({ type: GET_ORDER_HISTORY_REQUEST, meta: { silent } });
  try {
    const { data } = await api.get("/api/orders/user");
    dispatch({
      type: GET_ORDER_HISTORY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_ORDER_HISTORY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};
