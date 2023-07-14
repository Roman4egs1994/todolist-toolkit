import { Dispatch } from "redux";
import { authAPI } from "api/todolists-api";
import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "app/store";
import { authActions, authThunks } from "features/Login/auth-reducer";


export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";
export type InitialStateType = {
  status: RequestStatusType;
  error: string | null;
  isInitialized: boolean;
};


const initialState: InitialStateType = {
  status: "idle",
  error: null,
  isInitialized: false,
};


const slice = createSlice({
  name:'app',
  initialState: initialState,
  reducers:{
    setStatus:(state, action: PayloadAction<{status: RequestStatusType}>)=> {
      state.status = action.payload.status
    },
    setError:(state, action: PayloadAction<{error: string | null}>)=>{
      state.error = action.payload.error
    },
    setIsInitialized:(state, action: PayloadAction<{isInitialized:boolean}>)=>{
      console.log(current(state)); // показать стейт
      state.isInitialized = action.payload.isInitialized
    }
  },
  extraReducers:{}
})

const initializeAppTC = ():AppThunk => (dispatch: Dispatch) => {
  authAPI.me().then((res) => {
    if (res.data.resultCode === 0) {
      // dispatch(setIsLoggedInAC(true));
      dispatch(authActions.setIsLoggedIn({isLoggedIn: true}))
    } else {
    }

    // dispatch(setAppInitializedAC(true));
    dispatch(appAction.setIsInitialized({isInitialized: true}))
  });
};




export const appReducer = slice.reducer
export const appAction = slice.actions
export const appThunks = {initializeAppTC}