import { todolistsActions } from "./todolists-reducer";
import {
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  UpdateTaskModelType,
} from "api/todolists-api";
import { Dispatch } from "redux";
import { AppRootStateType, AppThunk } from "app/store";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { appAction } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: TasksStateType = {};

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
      // return {
      //   ...state,
      //   [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId),
      // };

      const index = state[action.payload.todolistId].findIndex(
        (todo) => todo.id === action.payload.taskId,
      );
      if (index !== -1) state[action.payload.todolistId].splice(index, 1);
    },
    addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      // return {
      //   ...state,
      //   [action.task.todoListId]: [action.task, ...state[action.task.todoListId]],
      // };

      state[action.payload.task.todoListId].unshift(action.payload.task);
    },
    updateTask: (
      state, action: PayloadAction<{ taskId: string; model: UpdateDomainTaskModelType; todolistId: string}>,
    ) => {
      // return {
      //   ...state,
      //   [action.todolistId]: state[action.todolistId].map((t) =>
      //     t.id === action.taskId ? { ...t, ...action.model } : t,
      //   ),
      // };

      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index !== -1) {
        tasks[index] = {...tasks[index], ...action.payload.model}
      }
    },
    setTask:(state, action: PayloadAction<{tasks: Array<TaskType>, todolistId: string}>)=>{
      // return { ...state, [action.todolistId]: action.tasks };

      state[action.payload.todolistId] = action.payload.tasks
    }
  },
  extraReducers: (builder) => {
    //Когда нужно обработать кейс, который создан был в другом slice  и для thunk
    builder
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        // const copyState = { ...state };
        // delete copyState[action.id];
        // return copyState;

        delete state[action.payload.id];
      })
      .addCase(todolistsActions.addTodolist, (state, action) => {
        // return { ...state, [action.todolist.id]: [] };
        state[action.payload.todolist.id] = [];
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
        // const copyState = { ...state };
        // action.todolists.forEach((tl) => {
        //   copyState[tl.id] = [];
        // });
        // return copyState;

        action.payload.todolist.forEach((tl) => {
          state[tl.id] = [];
        });
      });
  },
});

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = {};

// thunks
export const fetchTasksTC =
  (todolistId: string): AppThunk =>
  (dispatch) => {
    // dispatch(setAppStatusAC("loading"));
    dispatch(appAction.setStatus({ status: "loading" }));
    todolistsAPI.getTasks(todolistId).then((res) => {
      const tasks = res.data.items;
      // dispatch(setTasksAC(tasks, todolistId));
      dispatch(tasksActions.setTask({tasks,todolistId}))
      // dispatch(setAppStatusAC("succeeded"));
      dispatch(appAction.setStatus({ status: "succeeded" }));
    });
  };
export const removeTaskTC =
  (taskId: string, todolistId: string): AppThunk =>
  (dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
      // const action = removeTaskAC(taskId, todolistId);
      // dispatch(action);
      dispatch(tasksActions.removeTask({ taskId: taskId, todolistId: todolistId }));
    });
  };
export const addTaskTC =
  (title: string, todolistId: string): AppThunk =>
  (dispatch) => {
    // dispatch(setAppStatusAC("loading"));
    dispatch(appAction.setStatus({ status: "loading" }));
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const task = res.data.data.item;
          // const action = addTaskAC(task);
          // dispatch(action);
          dispatch(tasksActions.addTask({ task: task }));
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
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
  (dispatch, getState: () => AppRootStateType) => {
    const state = getState();
    const task = state.tasks[todolistId].find((t) => t.id === taskId);
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state");
      return;
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    };

    todolistsAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          // const action = updateTaskAC(taskId, domainModel, todolistId);
          const action = tasksActions.updateTask({taskId,todolistId,model:domainModel})
          dispatch(action);
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };

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