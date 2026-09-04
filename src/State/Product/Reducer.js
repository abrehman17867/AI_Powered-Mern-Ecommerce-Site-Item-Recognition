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
} from "./ActionType";

const initialState = {
  products: [],
  searchResults: [],
  product: null,
  // Blocking load — nothing on screen yet, a skeleton is appropriate.
  loading: false,
  // Background refetch with results already visible — show a thin bar, keep
  // the stale list rendered. Never swap the grid out for a spinner here.
  refreshing: false,
  // Set while a single product is being deleted, so the admin table can dim
  // just that row instead of blanking the whole table.
  deletingProductId: null,
  creating: false,
  error: null,
};

/**
 * A request is "silent" when the previous results are still worth showing.
 * The action may force it either way via `meta.silent`; otherwise we look at
 * what is already in the store, so a caller cannot forget to pass it.
 */
const isSilent = (action, hasExisting) => action.meta?.silent ?? hasExisting;

export const customerProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case FIND_PRODUCTS_REQUEST: {
      const silent = isSilent(action, Boolean(state.products?.content?.length));
      return {
        ...state,
        loading: !silent,
        refreshing: silent,
        error: null,
      };
    }
    case FIND_PRODUCT_BY_ID_REQUEST: {
      const silent = isSilent(action, Boolean(state.product));
      return {
        ...state,
        loading: !silent,
        refreshing: silent,
        error: null,
      };
    }
    case SEARCH_PRODUCTS_REQUEST:
      return {
        ...state,
        loading: !state.searchResults?.length,
        refreshing: Boolean(state.searchResults?.length),
        error: null,
      };

    case FIND_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: null,
        products: action.payload,
      };

    case SEARCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: null,
        searchResults: action.payload,
      };

    case FIND_PRODUCT_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: null,
        product: action.payload,
      };

    case CREATE_PRODUCT_REQUEST:
      return { ...state, creating: true, error: null };
    case CREATE_PRODUCT_SUCCESS:
      return { ...state, creating: false, error: null };
    case CREATE_PRODUCT_FAILURE:
      return { ...state, creating: false, error: action.payload };

    case DELETE_PRODUCT_REQUEST:
      return { ...state, deletingProductId: action.payload, error: null };

    // Drop the row from the cached page instead of leaving a sentinel key for a
    // useEffect to notice. The list stays on screen and correct; no refetch, so
    // no full-table "Loading products…" flash after a delete.
    case DELETE_PRODUCT_SUCCESS: {
      const page = state.products;
      const content = page?.content;
      if (!Array.isArray(content)) {
        return { ...state, deletingProductId: null, error: null };
      }
      const remaining = content.filter(
        (item) => String(item._id) !== String(action.payload)
      );
      return {
        ...state,
        deletingProductId: null,
        error: null,
        products: {
          ...page,
          content: remaining,
          totalProducts:
            typeof page.totalProducts === "number"
              ? Math.max(0, page.totalProducts - (content.length - remaining.length))
              : page.totalProducts,
        },
      };
    }
    case DELETE_PRODUCT_FAILURE:
      return { ...state, deletingProductId: null, error: action.payload };

    case FIND_PRODUCTS_FAILURE:
    case FIND_PRODUCT_BY_ID_FAILURE:
    case SEARCH_PRODUCTS_FAILURE:
      return { ...state, loading: false, refreshing: false, error: action.payload };

    default:
      return state;
  }
};
