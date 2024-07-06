import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { authReducer } from "./Auth/Reducer";
import { customerProductReducer } from "./Product/Reducer";
import { cartReducer } from "./Cart/Reducer";
import { orderReducer } from "./Order/Reducer";
import { thunk } from "redux-thunk";
import adminOrderReducer from "./Admin/Order/Reducer";
import { reviewReducer } from "./Review/Reducer";
import {ratingReducer}   from "./Rating/Reducer";
import { categoryReducer } from "./Category/Reducer";

const rootReducers = combineReducers({
  auth: authReducer,
  products: customerProductReducer,
  cart: cartReducer,
  order: orderReducer,
  adminOrder:adminOrderReducer,
  reviews: reviewReducer,
  ratings: ratingReducer,
  categories: categoryReducer,

});

export const store = legacy_createStore(rootReducers, applyMiddleware(thunk));
