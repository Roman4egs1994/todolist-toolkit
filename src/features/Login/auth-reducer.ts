import { Dispatch } from "redux";

import { authAPI, LoginParamsType } from "api/todolists-api";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { AppThunk } from "app/store";
import { appAction } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState: InitialStateType = {
  isLoggedIn: false,
};

type InitialStateType = {
  isLoggedIn: boolean;
};

const slice = createSlice({
  name:"auth",
  initialState:{
    isLoggedIn: false
  },
  reducers:{
    setIsLoggedIn:(state, action: PayloadAction<{isLoggedIn: boolean}>) => {
      state.isLoggedIn = action.payload.isLoggedIn
    }
  },
  extraReducers:{}
})


// thunks
const loginTC = (data: LoginParamsType): AppThunk => {
  return (dispatch: Dispatch) => {
    // dispatch(setAppStatusAC("loading"));
    dispatch(appAction.setStatus({ status: "loading" }));
    authAPI
      .login(data)
      .then((res) => {
        if (res.data.resultCode === 0) {
          // dispatch(setIsLoggedInAC(true));
          dispatch(authActions.setIsLoggedIn({isLoggedIn: true}))
          // dispatch(setAppStatusAC("succeeded"));
          dispatch(appAction.setStatus({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};
const logoutTC =
  ():AppThunk => (dispatch: Dispatch) => {
    // dispatch(setAppStatusAC("loading"));
    dispatch(appAction.setStatus({ status: "loading" }));
    authAPI
      .logout()
      .then((res) => {
        if (res.data.resultCode === 0) {
          // dispatch(setIsLoggedInAC(false));
          dispatch(authActions.setIsLoggedIn({isLoggedIn: false}))
          // dispatch(setAppStatusAC("succeeded"));
          dispatch(appAction.setStatus({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };


export const authReducer =  slice.reducer
export const authActions = slice.actions
export const authThunks = {loginTC,logoutTC}