import { getKanbanReal, addToKanbanReal, moveJobReal, getTodosReal, addTodoReal, toggleTodoReal, getCalendarEventsReal } from './realTrackerApi';
import { getKanbanMock, addToKanbanMock, moveJobMock, getTodosMock, addTodoMock, toggleTodoMock, getCalendarEventsMock } from './mockTrackerApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const getKanban = USE_MOCK ? getKanbanMock : getKanbanReal;
export const addToKanban = USE_MOCK ? addToKanbanMock : addToKanbanReal;
export const moveJob = USE_MOCK ? moveJobMock : moveJobReal;
export const getTodos = USE_MOCK ? getTodosMock : getTodosReal;
export const addTodo = USE_MOCK ? addTodoMock : addTodoReal;
export const toggleTodo = USE_MOCK ? toggleTodoMock : toggleTodoReal;
export const getCalendarEvents = USE_MOCK ? getCalendarEventsMock : getCalendarEventsReal;
