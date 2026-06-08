import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API – replace with real
    setTimeout(() => {
      setRoadmap(`## 3-Month Learning Roadmap

**Month 1: Core Skills**
- Learn Python advanced concepts
- Master SQL and database design
- Build a portfolio project (e.g., data analysis dashboard)

**Month 2: Specialization**
- Study machine learning fundamentals
- Complete TensorFlow certification
- Participate in Kaggle competition

**Month 3: Interview Prep**
- Practice LeetCode medium/hard problems
- Mock interviews with peers
- Update CV and LinkedIn`);
      setLoading(false);
    }, 1000);
  }, []);

  const exportPDF = () => {
    alert('PDF export coming soon (use html2pdf)');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Learning Roadmap</h1>
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200"
        >
          <Download size={18} /> Export PDF
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm prose prose-blue max-w-none">
          <div className="whitespace-pre-wrap">{roadmap}</div>
        </div>
      )}
    </motion.div>
  );
}
