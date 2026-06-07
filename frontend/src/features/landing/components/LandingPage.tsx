import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg to-surface">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            CareerPilot
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
            Your Agentic Career Co‑pilot – hunts jobs, scores your fit, drafts applications, and builds your learning roadmap.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-block border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition"
            >
              Sign Up
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-20 grid md:grid-cols-3 gap-8"
        >
          {[
            { title: 'Job Hunter Agent', desc: 'Find jobs that match your CV with AI-powered fit scores.' },
            { title: 'Personal AI Assistant', desc: 'Chat with an assistant that knows your CV and can draft cover letters, analyze gaps, and more.' },
            { title: 'Productivity Tracker', desc: 'Kanban, calendar, to‑do lists, and progress dashboard to keep you accountable.' }
          ].map((feature, i) => (
            <div key={i} className="glass-card rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-text-muted">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
