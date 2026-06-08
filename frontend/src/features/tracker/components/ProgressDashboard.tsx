import { useTrackerStore } from '../store/trackerSlice';

export default function ProgressDashboard() {
  const { kanban } = useTrackerStore();
  const applied = kanban?.applied?.length ?? 0;
  const interviewing = kanban?.interviewed?.length ?? 0;
  const offers = kanban?.accepted?.length ?? 0;
  const rejected = kanban?.rejected?.length ?? 0;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Progress Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-gray-500">Applied</p>
          <p className="text-2xl font-bold text-blue-600">{applied}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-gray-500">Interviewing</p>
          <p className="text-2xl font-bold text-yellow-600">{interviewing}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-gray-500">Offers</p>
          <p className="text-2xl font-bold text-green-600">{offers}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{rejected}</p>
        </div>
      </div>
    </div>
  );
}
