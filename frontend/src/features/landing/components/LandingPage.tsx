import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import LottieBackground from '../../../components/ui/LottieBackground';

export default function LandingPage() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch('/animations/background.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Failed to load Lottie:', err));
  }, []);

  return (
    <>
      {animationData && <LottieBackground animationData={animationData} />}
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900/20 to-transparent">
        <div className="container mx-auto px-4 py-20 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white drop-shadow-2xl">
              CareerPilot
            </h1>
            <p className="text-xl md:text-2xl text-white drop-shadow-lg mb-10 max-w-3xl mx-auto font-medium opacity-90">
              Your Agentic Career Co‑pilot – hunts jobs, scores your fit, drafts applications, and builds your learning roadmap.
            </p>
            <div className="flex justify-center gap-6">
              <Link
                to="/login"
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-xl font-bold text-lg"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition backdrop-blur-md font-bold text-lg"
              >
                Sign Up
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-24 grid md:grid-cols-3 gap-8"
          >
            {[
              { title: 'Job Hunter Agent', desc: 'Find jobs that match your CV with AI-powered fit scores.' },
              { title: 'Resume Coach', desc: 'Get actionable feedback, ATS analysis, and cover letter drafts.' },
              { title: 'Mock Interview', desc: 'Practice with an AI interviewer tailored to your specific job applications.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
