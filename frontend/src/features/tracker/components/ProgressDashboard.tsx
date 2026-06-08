import { useTrackerStore } from '../store/trackerSlice';

export default function ProgressDashboard() {
  const { kanban, todos } = useTrackerStore();

  const totalApplications = kanban.applied.length + kanban.interviewing.length + kanban.offer.length + kanban.rejected.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const roadmapProgress = todos.length > 0 ? (completedTodos / todos.length) * 100 : 0;

  // Simple streak calculation (mock – in real app track daily activity)
  const streak = 3; // placeholder

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Progress Dashboard</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg p-4 shadow-sm">
          <div className="text-text-muted text-sm">Applications Sent</div>
          <div className="text-3xl font-bold text-primary">{totalApplications}</div>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-sm">
          <div className="text-text-muted text-sm">Interviewing</div>
          <div className="text-3xl font-bold text-yellow-500">{kanban.interviewing.length}</div>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-sm">
          <div className="text-text-muted text-sm">Offers Received</div>
          <div className="text-3xl font-bold text-green-500">{kanban.offer.length}</div>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-sm">
          <div className="text-text-muted text-sm">Current Streak</div>
          <div className="text-3xl font-bold text-accent">{streak} days</div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Roadmap Progress</h3>
          <div className="w-full bg-surface-muted rounded-full h-4">
            <div className="bg-primary h-4 rounded-full" style={{ width: `${roadmapProgress}%` }}></div>
          </div>
          <p className="text-sm text-text-muted mt-2">{completedTodos} / {todos.length} tasks completed</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Job Search Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Applied</span>
              <span className="font-medium">{kanban.applied.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Interviewing</span>
              <span className="font-medium">{kanban.interviewing.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Offer</span>
              <span className="font-medium">{kanban.offer.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Rejected</span>
              <span className="font-medium">{kanban.rejected.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
