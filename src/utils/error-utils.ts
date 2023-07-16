
import { ResponseType } from "api/todolists-api";
import { Dispatch } from "redux";
import { appAction } from "app/app-reducer";
import axios, { AxiosError } from "axios";

export const handleServerAppError = <D>(
  data: ResponseType<D>,
  dispatch: Dispatch,
) => {
  if (data.messages.length) {
    // dispatch(setAppErrorAC(data.messages[0]));
      dispatch(appAction.setError({error: data.messages[0]}))
  } else {
        dispatch(appAction.setError({error: 'Some error occurred'}))
    // dispatch(setAppErrorAC("Some error occurred"));
  }
  // dispatch(setAppStatusAC("failed"));
  dispatch(appAction.setStatus({status: "failed"}))
};

//утилита для показа ошибок
export const handleServerNetworkError = (e: unknown, dispatch: Dispatch) => {
  const err = e as Error | AxiosError<{error: string}>
  if(axios.isAxiosError(err)) {
    const error = err.message ? err.message: 'Some error occurred'
    dispatch(appAction.setError({error}))
  } else {
    dispatch(appAction.setError({error : `Native error ${err.message}`}))
  }
  dispatch(appAction.setStatus({status: "failed"}))
}



export const _handleServerNetworkError = (
  error: { message: string },
  dispatch: Dispatch,
) => {
  dispatch(appAction.setError({error: error.message ? error.message : "Some error occurred"}))
  dispatch(appAction.setStatus({status: "failed"}))
  // dispatch(setAppErrorAC(error.message ? error.message : "Some error occurred"));
  // dispatch(setAppStatusAC("failed"));
};
