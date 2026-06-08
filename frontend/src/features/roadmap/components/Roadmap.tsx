import { useRoadmapStore } from '../store/roadmapSlice';
import { motion } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';

export default function Roadmap() {
  const { roadmapHtml, clearRoadmap } = useRoadmapStore();

  const exportPDF = () => {
    alert('PDF export coming soon');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Learning Roadmap</h1>
        {roadmapHtml && (
          <div className="flex gap-2">
            <button onClick={exportPDF} className="px-3 py-1 bg-gray-100 rounded-lg flex items-center gap-1"><Download size={16} /> PDF</button>
            <button onClick={clearRoadmap} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg flex items-center gap-1"><Trash2 size={16} /> Clear</button>
          </div>
        )}
      </div>
      {roadmapHtml ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: roadmapHtml }} />
      ) : (
        <div className="text-center text-gray-500 py-12">No roadmap generated yet. Click "Roadmap" on any job card to create one.</div>
      )}
    </div>
  );
}
