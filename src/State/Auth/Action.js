"use client";

import { api } from "../../config/apiConfig";
import { getUserFacingError } from "../../utils/userFacingError";
import { getCart } from "../Cart/Action";
import {
  GET_USER_FAILURE,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  CLEAR_AUTH_ERROR,
  REGISTER_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  SWITCH_ROLE_SUCCESS,
} from "./ActionType";

const registerRequest = () => ({ type: REGISTER_REQUEST });
const registerSuccess = (user) => ({ type: REGISTER_SUCCESS, payload: user });
const registerFailure = (error) => ({ type: REGISTER_FAILURE, payload: error });

export const register = (userData) => async (dispatch) => {
  dispatch(registerRequest());
  try {
    const { data } = await api.post("/auth/signup", userData);
    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
    }
    dispatch(registerSuccess(data.jwt));
    await dispatch(getUser(data.jwt));
    await dispatch(getCart());
  } catch (error) {
    dispatch(registerFailure(getUserFacingError(error, "register")));
  }
};

const loginRequest = () => ({ type: LOGIN_REQUEST });
const loginSuccess = (user) => ({ type: LOGIN_SUCCESS, payload: user });
const loginFailure = (error) => ({ type: LOGIN_FAILURE, payload: error });

export const login = (userData) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    const { data } = await api.post("/auth/signin", userData);
    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
    }
    dispatch(loginSuccess(data.jwt));
    await dispatch(getUser(data.jwt));
    await dispatch(getCart());
  } catch (error) {
    dispatch(loginFailure(getUserFacingError(error, "login")));
  }
};

const getUserRequest = (meta) => ({ type: GET_USER_REQUEST, meta });
const getUserSuccess = (user) => ({ type: GET_USER_SUCCESS, payload: user });
const getUserFailure = (error) => ({ type: GET_USER_FAILURE, payload: error });

export const clearAuthError = () => ({ type: CLEAR_AUTH_ERROR });

/**
 * Switches the active role server-side and stores the updated user. The server
 * rejects roles the account does not hold, so no client-side guard is needed.
 */
export const switchRole = (role) => async (dispatch) => {
  const { data } = await api.put("/api/users/role", { role });
  dispatch({ type: SWITCH_ROLE_SUCCESS, payload: data });
  return data;
};

export const getUser = (jwt, options = {}) => async (dispatch, getState) => {
  const token = jwt || localStorage.getItem("jwt");
  if (!token) return;

  const silent =
    options.silent === true ||
    (options.silent !== false && Boolean(getState().auth?.user));

  dispatch(getUserRequest({ silent }));

  try {
    const { data } = await api.get("/api/users/profile");
    dispatch(getUserSuccess(data));
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("jwt");
      dispatch({ type: LOGOUT, payload: null });
      return;
    }
    if (!silent) {
      dispatch(getUserFailure(getUserFacingError(error, "default")));
    }
  }
};

/** Refresh profile + cart after login without full-page loaders */
export const refreshSession = () => async (dispatch) => {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return;
  await dispatch(getUser(jwt, { silent: true }));
  await dispatch(getCart({ silent: true }));
};

export const updateUserProfile = (userId, profileData) => async (dispatch) => {
  try {
    const { data } = await api.put(`/api/users/${userId}/profile/update`, profileData);
    dispatch(getUserSuccess(data));
    return { success: true };
  } catch (error) {
    const message = getUserFacingError(error, "default");
    return { success: false, error: message };
  }
};

export const changePassword = (userId, { currentPassword, newPassword }) => async () => {
  try {
    await api.put(`/api/users/${userId}/password`, { currentPassword, newPassword });
    return { success: true };
  } catch (error) {
    return { success: false, error: getUserFacingError(error, "default") };
  }
};

/** @deprecated use updateUserProfile */
export const updateUser = (jwt, userId, updatedUserData) => (dispatch) =>
  dispatch(updateUserProfile(userId, updatedUserData));

export const logout = () => (dispatch) => {
  localStorage.removeItem("jwt");
  dispatch({ type: LOGOUT, payload: null });
};
