import React, { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppRootStateType } from "app/store";
import {
  FilterValuesType,
  TodolistDomainType, todolistsActions, todolistsThunks
} from "./todolists-reducer";
import { TasksStateType, tasksThunks} from "./tasks-reducer";
import { TaskStatuses } from "api/todolists-api";
import { Grid, Paper } from "@mui/material";
import { AddItemForm } from "components/AddItemForm/AddItemForm";
import { Todolist } from "./Todolist/Todolist";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "hooks/useAppDispatch";
import * as domain from "domain";

type PropsType = {
  demo?: boolean;
};

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(
    (state) => state.todolists,
  );
  const tasks = useSelector<AppRootStateType, TasksStateType>((state) => state.tasks);
  const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    // const thunk = fetchTodolistsTC();
    dispatch(todolistsThunks.fetchTodolists());
  }, []);

  const removeTask = useCallback(function (id: string, todolistId: string) {
    // const thunk = removeTaskTC(id, todolistId);
    dispatch(tasksThunks.removeTask({taskId:id, todolistId: todolistId}));
  }, []);

  const addTask = useCallback(function (title: string, todolistId: string) {
    dispatch(tasksThunks.addTask({todolistId,title}));
  }, []);

  const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
    const thunk = tasksThunks.updateTask({taskId:id, domainModel:{status}, todolistId});
    dispatch(thunk);
  }, []);

  const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
    // const thunk = updateTaskTC(id, { title: newTitle }, todolistId);
    const thunk = tasksThunks.updateTask({taskId:id, domainModel:{title:newTitle}, todolistId})
    dispatch(thunk);
  }, []);

  const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
    // const action = changeTodolistFilterAC(todolistId, value);
    dispatch(todolistsActions.changeTodolistFilter({id:todolistId, filter:value}));
  }, []);

  const removeTodolist = useCallback(function (id: string) {
    // const thunk = removeTodolistTC(id);
    dispatch(todolistsThunks.removeTodolist({todolistId:id}));
  }, []);

  const changeTodolistTitle = useCallback(function (id: string, title: string) {
    // const thunk = changeTodolistTitleTC(id, title);
    dispatch(todolistsThunks.changeTodolistTitle({title:title,id:id}));
  }, []);

  const addTodolist = useCallback(
    (title: string) => {
      // const thunk = addTodolistTC(title);
      dispatch(todolistsThunks.addTodolist(title));
    },
    [dispatch],
  );

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <Grid container style={{ padding: "20px" }}>
        <AddItemForm addItem={addTodolist} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id];

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: "10px" }}>
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTask}
                  changeFilter={changeFilter}
                  addTask={addTask}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolist}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitle}
                  demo={demo}
                />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
