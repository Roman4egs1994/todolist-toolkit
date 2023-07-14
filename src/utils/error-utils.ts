
import { ResponseType } from "api/todolists-api";
import { Dispatch } from "redux";
import { appAction } from "app/app-reducer";

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

export const handleServerNetworkError = (
  error: { message: string },
  dispatch: Dispatch,
) => {
  dispatch(appAction.setError({error: error.message ? error.message : "Some error occurred"}))
  dispatch(appAction.setStatus({status: "failed"}))
  // dispatch(setAppErrorAC(error.message ? error.message : "Some error occurred"));
  // dispatch(setAppStatusAC("failed"));
};
