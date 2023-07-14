import { todolistsAPI, TodolistType } from "api/todolists-api";
import { Dispatch } from "redux";
import {
  appAction,
  RequestStatusType
} from "app/app-reducer";
import { handleServerNetworkError } from "utils/error-utils";
import { AppThunk } from "app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = [];

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers:{
    removeTodolist:(state, action:PayloadAction<{id:string}>)=>{
      //return state.filter((tl) => tl.id != action.id);
      const index = state.findIndex(todo => todo.id === action.payload.id)
      if (index !== -1) state.splice(index, 1)
    },
    addTodolist:(state, action:PayloadAction<{todolist: TodolistType}>) => {
      // return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state];
      const newTodo:TodolistDomainType = { ...action.payload.todolist, filter: "all", entityStatus: "idle" }
      state.unshift(newTodo)
    },
    changeTodolistTitle:(state, action:PayloadAction<{id: string, title: string}>) => {
      //return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl));
      const index = state.findIndex(todo => todo.id === action.payload.id)
      if (index !== -1) state[index].title = action.payload.title
    },
    changeTodolistFilter:(state, action:PayloadAction<{id:string,filter:FilterValuesType}>) => {
      // return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl));
      const index = state.findIndex(todo => todo.id === action.payload.id)
      if(index !== -1) state[index].filter = action.payload.filter
    },
    changeTodolistEntityStatus:(state, action:PayloadAction<{id:string,status:RequestStatusType}>) => {
      const index = state.findIndex(todo => todo.id === action.payload.id)
      if(index !== -1) state[index].entityStatus = action.payload.status
    },
    setTodolists:(state, action: PayloadAction<{todolist: TodolistType[]}>) => {
      // return action.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
      return action.payload.todolist.map(tl => ({...tl, filter:"all", entityStatus: "idle"}))
    }
  },
  extraReducers:{

  }
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todolistsThunks = {}


// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    // dispatch(setAppStatusAC("loading"));
        dispatch(appAction.setStatus({status: 'loading'}))
    todolistsAPI
      .getTodolists()
      .then((res) => {
        // dispatch(setTodolistsAC(res.data));
        dispatch(todolistsActions.setTodolists({todolist: res.data}))
        // dispatch(setAppStatusAC("succeeded"));
        dispatch(appAction.setStatus({status: 'succeeded'}))
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};
export const removeTodolistTC = (todolistId: string):AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    // dispatch(setAppStatusAC("loading"));
    dispatch(appAction.setStatus({status: 'loading'}))
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    // dispatch(changeTodolistEntityStatusAC(todolistId, "loading"));
      dispatch(todolistsActions.changeTodolistEntityStatus({id:todolistId, status: "loading"}))
    todolistsAPI.deleteTodolist(todolistId).then((res) => {
      // dispatch(removeTodolistAC(todolistId));
        dispatch(todolistsActions.removeTodolist({id: todolistId}))
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appAction.setStatus({status: 'succeeded'}))
    });
  };
};
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    // dispatch(setAppStatusAC("loading"));
    dispatch(appAction.setStatus({status: 'loading'}))
    todolistsAPI.createTodolist(title).then((res) => {
      // dispatch(addTodolistAC(res.data.data.item));
      dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}))
      // dispatch(setAppStatusAC("succeeded"));
      dispatch(appAction.setStatus({status: 'succeeded'}))
    });
  };
};
export const changeTodolistTitleTC = (id: string, title: string):AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      // dispatch(changeTodolistTitleAC(id, title));
        dispatch(todolistsActions.changeTodolistTitle({id,title}))
    });
  };
};

