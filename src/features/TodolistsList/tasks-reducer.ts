import { todolistsActions, todolistsThunks } from "./todolists-reducer";
import {
  AddTaskArgType,
  RemoveTaskArgType,
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI, UpdateTaskArgType, UpdateTaskModelType
} from "api/todolists-api";
import { AppDispatch, AppRootStateType } from "app/store";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { appAction } from "app/app-reducer";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";
import { ResultCode } from "common/common.enums";

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};

const initialState: TasksStateType = {};

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {},
  extraReducers: (builder) => {
    //Когда нужно обработать кейс, который создан был в другом slice  и для thunk
    builder
      .addCase(updateTask.fulfilled, (state, action)=>{
        const tasks = state[action.payload.todolistId];
        const index = tasks.findIndex((t) => t.id === action.payload.taskId);
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...action.payload.domainModel };
        }
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const index = state[action.payload.todolistId].findIndex(
          (todo) => todo.id === action.payload.taskId,
        );
        if (index !== -1) state[action.payload.todolistId].splice(index, 1);
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state[action.payload.task.todoListId].unshift(action.payload.task);
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.todolistId];
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.data.item.id] = [];
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolist.forEach((tl) => {
          state[tl.id] = [];
        });
      });
  },
});


const fetchTasks = createAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string, { state: AppRootStateType;
    dispatch: AppDispatch;
    rejectValue: null;
  }
>("tasks/fetchTask", async (todolistId, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  dispatch(appAction.setStatus({ status: "loading" }));
  try {
    const res = await todolistsAPI.getTasks(todolistId);
    const tasks = res.data.items;
    dispatch(appAction.setStatus({ status: "succeeded" }));
    return { tasks, todolistId };
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  }
});

const removeTask = createAppAsyncThunk<RemoveTaskArgType, RemoveTaskArgType>(
  "tasks/removeTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(appAction.setStatus({ status: "loading" }));
    try {
      const res = await todolistsAPI.deleteTask(arg);
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


const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>(
  "tasks/addTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(appAction.setStatus({ status: "loading" }));
    try {
      const res = await todolistsAPI.createTask(arg);
      if (res.data.resultCode === 0) {
        const task = res.data.data.item;
        dispatch(appAction.setStatus({ status: "succeeded" }));
        return { task };
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

const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>("tasks/updateTask", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue, getState } = thunkAPI;

    try {
      const state = getState();
      const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
      console.log(task);
      if (!task) {
        //throw new Error("task not found in the state");
        console.warn("task not found in the state");
        return rejectWithValue(null);
      }

      const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...arg.domainModel,
    };

      const res =  await todolistsAPI.updateTask(arg.taskId,arg.todolistId, apiModel)
        if (res.data.resultCode === ResultCode.Success) {
          dispatch(appAction.setStatus({ status: "succeeded" }));
          return  arg

            // return {taskId: arg.taskId,model: arg.domainModel,  todolistId: arg.todolistId }
        } else {
          handleServerAppError(res.data, dispatch);
          return rejectWithValue(null);
        }

    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }


});


export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = { fetchTasks, addTask, removeTask, updateTask };
// , removeTask
