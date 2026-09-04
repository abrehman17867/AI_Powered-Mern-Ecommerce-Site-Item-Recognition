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
  PLACED_ORDER_FAILURE,
  PLACED_ORDER_REQUEST,
  PLACED_ORDER_SUCCESS,
  SHIP_ORDER_FAILURE,
  SHIP_ORDER_REQUEST,
  SHIP_ORDER_SUCCESS,
} from "./ActionType";

const initialState = {
  orders: [],
  // First load, when there is nothing to show yet — the only time a skeleton
  // is allowed to replace the table.
  loading: false,
  // Background refetch with rows already on screen — shows a thin bar instead.
  refreshing: false,
  // Id of the order whose status is being changed / that is being deleted, so
  // the busy state is scoped to one row rather than the whole page.
  mutatingOrderId: null,
  error: null,
};

/**
 * Merge a server response for one order back into the list.
 *
 * The status endpoints return the full populated order, but we still merge
 * field-by-field over the existing row: if a response ever comes back without
 * `orderItems` / `user` populated, the row keeps what it already had rather
 * than blanking out mid-table.
 */
const mergeOrder = (orders, updated) => {
  if (!updated?._id) return orders;
  return orders.map((order) =>
    String(order._id) === String(updated._id) ? { ...order, ...updated } : order
  );
};

const adminOrderReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ORDERS_REQUEST: {
      // Decided here rather than at the call site so no caller can forget it.
      const hasRows = state.orders.length > 0;
      return {
        ...state,
        loading: !hasRows,
        refreshing: hasRows,
        error: null,
      };
    }
    case GET_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        refreshing: false,
        orders: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };
    case GET_ORDERS_FAILURE:
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: action.payload,
      };

    case CONFIRMED_ORDER_REQUEST:
    case PLACED_ORDER_REQUEST:
    case DELIVERED_ORDER_REQUEST:
    case CANCELLED_ORDER_REQUEST:
    case SHIP_ORDER_REQUEST:
    case DELETE_ORDER_REQUEST:
      return {
        ...state,
        mutatingOrderId: action.payload ?? null,
        error: null,
      };

    // Every status change patches the row in place. There is no refetch and no
    // sentinel key for an effect to watch, so the table never blanks after an
    // update — which is what the old `confirmed`/`shipped`/`delivered` keys and
    // their dependent useEffect were doing.
    case CONFIRMED_ORDER_SUCCESS:
    case PLACED_ORDER_SUCCESS:
    case DELIVERED_ORDER_SUCCESS:
    case CANCELLED_ORDER_SUCCESS:
    case SHIP_ORDER_SUCCESS:
      return {
        ...state,
        orders: mergeOrder(state.orders, action.payload),
        mutatingOrderId: null,
        error: null,
      };

    // The delete endpoint returns an empty body, so the action supplies the id.
    case DELETE_ORDER_SUCCESS:
      return {
        ...state,
        orders: state.orders.filter(
          (order) => String(order._id) !== String(action.payload)
        ),
        mutatingOrderId: null,
        error: null,
      };

    case CONFIRMED_ORDER_FAILURE:
    case PLACED_ORDER_FAILURE:
    case DELIVERED_ORDER_FAILURE:
    case CANCELLED_ORDER_FAILURE:
    case SHIP_ORDER_FAILURE:
    case DELETE_ORDER_FAILURE:
      return {
        ...state,
        mutatingOrderId: null,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default adminOrderReducer;
