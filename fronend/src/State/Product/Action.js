import {
  CREATE_PRODUCT_FAILURE,
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  FIND_PRODUCTS_FAILURE,
  FIND_PRODUCTS_REQUEST,
  FIND_PRODUCTS_SUCCESS,
  FIND_PRODUCT_BY_ID_FAILURE,
  FIND_PRODUCT_BY_ID_REQUEST,
  FIND_PRODUCT_BY_ID_SUCCESS,
  SEARCH_PRODUCTS_FAILURE,
  SEARCH_PRODUCTS_REQUEST,
  SEARCH_PRODUCTS_SUCCESS,
  // GET_ALL_CATEGORIES_REQUEST,
  // GET_ALL_CATEGORIES_SUCCESS,
  // GET_ALL_CATEGORIES_FAILURE,
  // GET_PRODUCTS_BY_CATEGORY_REQUEST,
  // GET_PRODUCTS_BY_CATEGORY_SUCCESS,
  // GET_PRODUCTS_BY_CATEGORY_FAILURE,
} from "./ActionType";
import { api } from "../../config/apiConfig";

export const findProducts = (reqData) => async (dispatch) => {
  dispatch({ type: FIND_PRODUCTS_REQUEST });
  const {
    colors,
    sizes,
    minPrice,
    maxPrice,
    minDiscount,
    category,
    stock,
    sort,
    pageNumber,
    pageSize,
  } = reqData;
  try {
    const { data } = await api.get(
      `/api/products?color=${colors}&size=${sizes}&minPrice=${minPrice}&maxPrice=${maxPrice}&minDiscount=${minDiscount}&category=${category}&stock=${stock}&sort=${sort}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    );

    console.log("product data : ", data);
    dispatch({ type: FIND_PRODUCTS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FIND_PRODUCTS_FAILURE, payload: error.message });
  }
};

export const findAllProducts = (reqData) => async (dispatch) => {
  dispatch({ type: FIND_PRODUCTS_REQUEST });
  const {
    colors,
    sizes,
    minPrice,
    maxPrice,
    minDiscount,
    stock,
    sort,
    pageNumber,
    pageSize,
  } = reqData;
  try {
    const { data } = await api.get(
      `/api/products?color=${colors}&size=${sizes}&minPrice=${minPrice}&maxPrice=${maxPrice}&minDiscount=${minDiscount}&stock=${stock}&sort=${sort}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    );

    console.log("product data : ", data);
    dispatch({ type: FIND_PRODUCTS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FIND_PRODUCTS_FAILURE, payload: error.message });
  }
};


export const findProductsById = (reqData) => async (dispatch) => {
  dispatch({ type: FIND_PRODUCT_BY_ID_REQUEST });
  // const  {productId } = reqData;
  const productId = reqData.data?.productId;
  console.log("Product ID : ",productId)
  try {
    const { data } = await api.get(`/api/products/id/${productId}`);
    dispatch({ type: FIND_PRODUCT_BY_ID_SUCCESS, payload: data });
    console.log("data : ",data)
  } catch (error) {
    //console.error("Error fetching product by ID:", error.message);
    dispatch({ type: FIND_PRODUCT_BY_ID_FAILURE, payload: error.message });
  }
};

export const createProduct = (product) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });
    const { data } = await api.post(`/api/admin/products`,product);
    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: data });
    console.log("Created Products : ",data)
  } catch (error) {
    dispatch({ type: CREATE_PRODUCT_FAILURE, payload: error.message });
  }
};

export const deleteProduct = (productId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });
    const { data } = await api.delete(`/api/admin/products/${productId}/delete`);
    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: productId });
    console.log("Delete product : ",data)
  } catch (error) {
    dispatch({ type: DELETE_PRODUCT_FAILURE, payload: error.message });
  }
};

// export const searchProducts = (searchQuery) => async (dispatch) => {
//   dispatch({ type: SEARCH_PRODUCTS_REQUEST });
//   try {
//     const { data } = await api.get(`/api/products/search?q=${searchQuery}`);
//     dispatch({ type: SEARCH_PRODUCTS_SUCCESS, payload: data });
//   } catch (error) {
//     dispatch({ type: SEARCH_PRODUCTS_FAILURE, payload: error.message });
//   }
// };

export const searchProducts = (searchQuery) => async (dispatch) => {
  dispatch({ type: SEARCH_PRODUCTS_REQUEST });
  try {
    const { data } = await api.get(`/api/products/search?q=${searchQuery}`);
    if (data) {
      dispatch({ type: SEARCH_PRODUCTS_SUCCESS, payload: data });
    } else {
      dispatch({ type: SEARCH_PRODUCTS_FAILURE, payload: 'No data found' });
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      dispatch({ type: SEARCH_PRODUCTS_FAILURE, payload: error.response.data.message });
    } else {
      dispatch({ type: SEARCH_PRODUCTS_FAILURE, payload: error.message });
    }
  }
};


// export const getAllCategories = () => async (dispatch) => {
//   try {
//     dispatch({ type: GET_ALL_CATEGORIES_REQUEST });
//     const { data } = await api.get(`/api/categories`);
//     dispatch({ type: GET_ALL_CATEGORIES_SUCCESS, payload: data });
//     console.log("Categories : ", data);
//   } catch (error) {
//     dispatch({ type: GET_ALL_CATEGORIES_FAILURE, payload: error.message });
//   }
// };

// export const getProductsByCategory = (categoryName) => async (dispatch) => {
//   try {
//     dispatch({ type: GET_PRODUCTS_BY_CATEGORY_REQUEST });
//     const { data } = await api.get(`/api/products/category/${categoryName}`);
//     dispatch({ type: GET_PRODUCTS_BY_CATEGORY_SUCCESS, payload: data });
//     console.log("Products by Category : ", data);
//   } catch (error) {
//     dispatch({ type: GET_PRODUCTS_BY_CATEGORY_FAILURE, payload: error.message });
//   }
// };