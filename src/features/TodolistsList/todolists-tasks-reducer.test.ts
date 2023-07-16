import { TodolistDomainType, todolistsActions, todolistsReducer, todolistsThunks } from "./todolists-reducer";
import { tasksReducer, TasksStateType } from "./tasks-reducer";
import { TodolistType } from "api/todolists-api";
import any = jasmine.any;

test("ids should be equals", () => {
  const startTasksState: TasksStateType = {};
  const startTodolistsState: Array<TodolistDomainType> = [];

  let todolist: TodolistType = {
    title: "new todolist",
    id: "any id",
    addedDate: "",
    order: 0,
  };

  // const action = addTodolistAC(todolist);
  // const action = todolistsActions.addTodolist({todolist:todolist});
  const action = todolistsThunks.addTodolist.fulfilled({
    resultCode: 0,
    messages: [],
    data: { item: todolist },
  }, "requestId", '' );

  const endTasksState = tasksReducer(startTasksState, action);
  const endTodolistsState = todolistsReducer(startTodolistsState, action);

  const keys = Object.keys(endTasksState);
  const idFromTasks = keys[0];
  const idFromTodolists = endTodolistsState[0].id;

  expect(idFromTasks).toBe(action.payload.data.item.id);
  expect(idFromTodolists).toBe(action.payload.data.item.id);
});
