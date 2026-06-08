import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { useTrackerStore } from '../store/trackerSlice';
import KanbanColumn from './KanbanColumn';

const columnIds = ['wishlist', 'applied', 'interviewing', 'offer', 'rejected'];
const columnTitles = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
};
const columnColors = {
  wishlist: 'border-gray-400',
  applied: 'border-blue-400',
  interviewing: 'border-yellow-400',
  offer: 'border-green-400',
  rejected: 'border-red-400',
};

export default function KanbanBoard({ showTitle = true }: { showTitle?: boolean }) {
  const { kanban, moveJob, reorderJobs } = useTrackerStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let sourceColumn: string | null = null;
    let sourceIndex = -1;
    for (const col of columnIds) {
      const idx = kanban[col as keyof typeof kanban]?.findIndex((j) => j.id === activeId);
      if (idx !== -1) {
        sourceColumn = col;
        sourceIndex = idx;
        break;
      }
    }

    if (columnIds.includes(overId)) {
      if (sourceColumn && sourceColumn !== overId) {
        // Find job title for notification
        const job = kanban[sourceColumn as keyof typeof kanban].find(j => j.id === activeId);
        moveJob(activeId, sourceColumn, overId, job?.title);
      }
    } else {
      if (sourceColumn) {
        let targetIndex = kanban[sourceColumn as keyof typeof kanban].findIndex((j) => j.id === overId);
        if (targetIndex !== -1 && sourceIndex !== -1 && sourceIndex !== targetIndex) {
          const newJobs = arrayMove(kanban[sourceColumn as keyof typeof kanban], sourceIndex, targetIndex);
          reorderJobs(sourceColumn, newJobs);
        }
      }
    }
  };

  return (
    <div className={`${showTitle ? 'p-4' : ''}`}>
      {showTitle && <h2 className="text-2xl font-bold mb-6 text-gray-800">Job Application Tracker</h2>}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {columnIds.map((col) => (
            <KanbanColumn
              key={col}
              id={col}
              title={columnTitles[col as keyof typeof columnTitles]}
              jobs={kanban[col as keyof typeof kanban]}
              color={columnColors[col as keyof typeof columnColors]}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
