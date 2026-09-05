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
import { lineTotal, unitPrice } from "../../utils/cartPricing";

const initialState = {
  cart: {
    cartItems: [],
    totalPrice: 0,
    totalDiscountedPrice: 0,
    discounte: 0,
  },
  loading: false,
  // Product id currently being added, so the card the shopper actually pressed
  // shows the progress rather than every Add to cart button on the page.
  addingProductId: null,
  addingItem: false,
  // Item ids with a quantity change still in flight. A Set-like map rather
  // than a single id, because taps are debounced and can overlap.
  pendingItemIds: [],
  // Only a removal blocks its row; quantity changes stay interactive.
  removingItemId: null,
  // Bumped by every successful mutation. A GET that started before the latest
  // mutation carries an older version and is discarded on arrival — otherwise
  // a slow in-flight read lands after a write and reverts the cart to the
  // quantity the shopper just changed away from.
  version: 0,
  error: null,
};

/**
 * Recompute cart totals from the items we hold.
 *
 * Used only to keep an optimistic quantity change coherent for the fraction of
 * a second before the server's own totals arrive and replace these.
 */
function recalculate(cart) {
  const items = cart.cartItems || [];
  const totalDiscountedPrice = items.reduce((sum, i) => sum + lineTotal(i), 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + unitPrice(i) * Math.max(1, Number(i.quantity) || 1),
    0
  );
  return {
    ...cart,
    totalPrice,
    totalDiscountedPrice,
    discounte: Math.max(0, totalPrice - totalDiscountedPrice),
    totalItem: items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0),
  };
}

const withoutId = (list, id) => list.filter((x) => String(x) !== String(id));

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ITEM_TO_CART_REQUEST:
      return {
        ...state,
        addingItem: true,
        addingProductId: action.payload ?? null,
        error: null,
      };
    case ADD_ITEM_TO_CART_SUCCESS:
      return {
        ...state,
        version: state.version + 1,
        addingItem: false,
        addingProductId: null,
        // The endpoint now returns the refreshed cart, so there is no
        // follow-up GET to wait on.
        cart: action.payload ? action.payload : state.cart,
        error: null,
      };
    case ADD_ITEM_TO_CART_FAILURE:
      return {
        ...state,
        addingItem: false,
        addingProductId: null,
        error: action.payload,
      };

    case GET_CART_REQUEST:
      return {
        ...state,
        loading: action.meta?.silent ? state.loading : true,
        error: action.meta?.silent ? state.error : null,
      };
    case GET_CART_SUCCESS: {
      // Stale read: a mutation completed while this request was in flight.
      if (
        action.meta?.version !== undefined &&
        action.meta.version !== state.version
      ) {
        return { ...state, loading: false };
      }
      return {
        ...state,
        cart: action.payload,
        loading: false,
        pendingItemIds: [],
        removingItemId: null,
        error: null,
      };
    }
    case GET_CART_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
        removingItemId: null,
      };

    // Move the number now. The row stays interactive so the shopper can keep
    // tapping; the debounced request that follows carries the final value.
    case SET_CART_ITEM_QUANTITY_OPTIMISTIC: {
      const { cartItemId, quantity } = action.payload;
      const items = (state.cart.cartItems || []).map((item) =>
        String(item._id) === String(cartItemId)
          ? { ...item, quantity: Math.max(1, Number(quantity) || 1) }
          : item
      );
      return {
        ...state,
        version: state.version + 1,
        cart: recalculate({ ...state.cart, cartItems: items }),
      };
    }

    case UPDATE_CART_ITEM_REQUEST:
      return {
        ...state,
        pendingItemIds: [...withoutId(state.pendingItemIds, action.payload), action.payload],
        error: null,
      };
    case UPDATE_CART_ITEM_SUCCESS:
      return {
        ...state,
        version: state.version + 1,
        pendingItemIds: withoutId(state.pendingItemIds, action.payload?.cartItemId),
        cart: action.payload?.cart ? action.payload.cart : state.cart,
        error: null,
      };
    case UPDATE_CART_ITEM_FAILURE:
      return {
        ...state,
        pendingItemIds: withoutId(state.pendingItemIds, action.payload?.cartItemId),
        error: action.payload?.message ?? action.payload,
      };

    case REMOVE_CART_ITEM_REQUEST:
      return { ...state, removingItemId: action.payload, error: null };
    case REMOVE_CART_ITEM_SUCCESS:
      return {
        ...state,
        version: state.version + 1,
        removingItemId: null,
        cart: action.payload?.cart ? action.payload.cart : state.cart,
        error: null,
      };
    case REMOVE_CART_ITEM_FAILURE:
      return {
        ...state,
        removingItemId: null,
        error: action.payload?.message ?? action.payload,
      };

    default:
      return state;
  }
};
