import { appAction, appReducer, InitialStateType } from "./app-reducer";

let startState: InitialStateType;

beforeEach(() => {
  startState = {
    error: null,
    status: "idle",
    isInitialized: false,
  };
});

test("correct error message should be set", () => {
  // const endState = appReducer(startState, setAppErrorAC("some error"));
  const endState = appReducer(startState, appAction.setError({error:"some error"}));
  expect(endState.error).toBe("some error");
});

test("correct status should be set", () => {
  // const endState = appReducer(startState, setAppStatusAC("loading"));
  const endState = appReducer(startState, appAction.setStatus({status: "loading"}));
  expect(endState.status).toBe("loading");
});
