export const getKanbanMock = async () => ({
  wishlist: [],
  applied: [],
  interviewing: [],
  offer: [],
  rejected: [],
});

export const addToKanbanMock = async (_job: any, _status: string) => ({ success: true });

export const moveJobMock = async (_jobId: string, _toStatus: string, _jobTitle?: string) => ({ success: true });

export const getTodosMock = async () => [];

export const addTodoMock = async (_text: string, _dueDate: string) => ({ id: 'mock-todo-' + Date.now() });

export const toggleTodoMock = async (_id: string, _completed: boolean, _text?: string) => ({ success: true });

export const getCalendarEventsMock = async () => [];
