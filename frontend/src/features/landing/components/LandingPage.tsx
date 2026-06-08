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
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-20 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              CareerPilot
            </h1>
            <p className="text-xl text-white drop-shadow-md mb-8">
              Your AI‑powered career co‑pilot – hunts jobs, scores your fit, and builds your roadmap.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition shadow-lg"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition backdrop-blur-sm"
              >
                Sign Up
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 grid md:grid-cols-3 gap-8"
          >
            {[
              { title: 'Smart Job Search', desc: 'Live jobs with AI fit scores.' },
              { title: 'Resume Coach', desc: 'Get actionable feedback and ATS score.' },
              { title: 'Mock Interview', desc: 'Practice with AI interviewer.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/30">
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/80">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
