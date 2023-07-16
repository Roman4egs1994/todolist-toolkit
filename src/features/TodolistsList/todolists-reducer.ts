import { DeleteTodolistType, ResponseType, todolistsAPI, TodolistType, UpdateTodolistType } from "api/todolists-api";
import { appAction, RequestStatusType } from "app/app-reducer";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { AppThunk } from "app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";
import { ResultCode } from "common/common.enums";

const initialState: Array<TodolistDomainType> = [];

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    // changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
    //   //return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl));
    //   const index = state.findIndex((todo) => todo.id === action.payload.id);
    //   if (index !== -1) state[index].title = action.payload.title;
    // },
    changeTodolistFilter: (
      state,
      action: PayloadAction<{ id: string; filter: FilterValuesType }>,
    ) => {
      // return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl));
      const index = state.findIndex((todo) => todo.id === action.payload.id);
      if (index !== -1) state[index].filter = action.payload.filter;
    },
    changeTodolistEntityStatus: (
      state,
      action: PayloadAction<{ id: string; status: RequestStatusType }>,
    ) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id);
      if (index !== -1) state[index].entityStatus = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
      return action.payload.todolist.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
    })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action)=> {
        const index = state.findIndex((todo) => todo.id === action.payload.todolistId);
        if (index !== -1) state.splice(index, 1);
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state,action)=> {
        const newTodo: TodolistDomainType = {
          ...action.payload.data.item,
          filter: "all",
          entityStatus: "idle",
        };
        state.unshift(newTodo);
      })
      .addCase(todolistsThunks.changeTodolistTitle.fulfilled, (state, action)=>{
        const index = state.findIndex((todo) => todo.id === action.payload.id);
        if (index !== -1) state[index].title = action.payload.title;
      })
  },
});

// thunks
const fetchTodolists = createAppAsyncThunk<
  {
    todolist: TodolistType[];
  },
  void
>("todolists/fetchTodolists", async (_, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  dispatch(appAction.setStatus({ status: "loading" }));
  try {
    const res = await todolistsAPI.getTodolists();
    const todolist = res.data;
    dispatch(appAction.setStatus({ status: "succeeded" }));
    return { todolist };
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  }
});

const removeTodolist = createAppAsyncThunk<DeleteTodolistType, DeleteTodolistType>(
  "todolist/removeTodolist",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(appAction.setStatus({ status: "loading" }));
    try {
      dispatch(
        todolistsActions.changeTodolistEntityStatus({ id: arg.todolistId, status: "loading" }),
      );
      const res = await todolistsAPI.deleteTodolist(arg);
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appAction.setStatus({ status: "succeeded" }));
        return arg;
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  },
);


  const addTodolist = createAppAsyncThunk<ResponseType<{ item: TodolistType }>, string>('todolist/addTodolist', async (title, thunkAPI)=>{
     const { dispatch, rejectWithValue } = thunkAPI;
      dispatch(appAction.setStatus({ status: "loading" }));
     try {
       const res = await todolistsAPI.createTodolist(title);

       if (res.data.resultCode === ResultCode.Success) {
         dispatch(appAction.setStatus({ status: "succeeded" }));
         const todolist = res.data
         return  todolist
       } else {
         handleServerAppError(res.data, dispatch);
         return rejectWithValue(null);
       }
     } catch (e) {
         handleServerNetworkError(e, dispatch);
         return rejectWithValue(null);
     }
  })


export const changeTodolistTitle =  createAppAsyncThunk<UpdateTodolistType,UpdateTodolistType>('todolist/changeTodolistTitle', async (arg, thunkAPI)=>{
  const {dispatch,rejectWithValue} = thunkAPI

    try {
      const res =  await todolistsAPI.updateTodolist({title:arg.title,id:arg.id})
      console.log(res);
      return {title: arg.title, id: arg.id}
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
})


// export const _changeTodolistTitleTC = (id: string, title: string): AppThunk => {
//   return (dispatch) => {
//     todolistsAPI.updateTodolist(id, title).then((res) => {
//       // dispatch(changeTodolistTitleAC(id, title));
//       dispatch(todolistsActions.changeTodolistTitle({ id, title }));
//     });
//   };
// };

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todolistsThunks = { fetchTodolists, removeTodolist ,addTodolist,changeTodolistTitle};
