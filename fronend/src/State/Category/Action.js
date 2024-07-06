import {
  GET_ALL_CATEGORIES_REQUEST,
  GET_ALL_CATEGORIES_SUCCESS,
  GET_ALL_CATEGORIES_FAILURE,
} from "./ActionType";
import { api } from "../../config/apiConfig";

export const getAllCategories = () => async (dispatch) => {
  dispatch({ type: GET_ALL_CATEGORIES_REQUEST });
  try {
    const { data } = await api.get(`/api/products/categories`);
    dispatch({ type: GET_ALL_CATEGORIES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_ALL_CATEGORIES_FAILURE, payload: error.message });
  }
};
