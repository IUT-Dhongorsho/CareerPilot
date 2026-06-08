export const getKanbanMock = async () => ({
  wishlist: [],
  applied: [],
  interviewing: [],
  offer: [],
  rejected: [],
});

export const addToKanbanMock = async (_job: any, _status: string) => ({ success: true });

export const moveJobMock = async (_jobId: string, _from: string, _to: string) => ({ success: true });

export const getTodosMock = async () => [];

export const addTodoMock = async (_text: string, _dueDate: string) => ({ id: 'mock-todo-' + Date.now() });

export const toggleTodoMock = async (_id: string) => ({ success: true });

export const getCalendarEventsMock = async () => [];
