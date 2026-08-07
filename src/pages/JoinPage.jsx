import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Zap, ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function JoinPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [teachSkill, setTeachSkill] = useState('React & Frontend');
  const [learnSkill, setLearnSkill] = useState('UI/UX Design');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#FFE569', '#FF6B6B', '#4ECDC4']
      });
    } catch (err) {}
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      
      {/* BACK BUTTON */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="neo-btn bg-paper-cream hover:bg-paper-dark text-swaply-black px-4 py-2 rounded-xl text-xs font-bold shadow-hard-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <div className="neo-card rounded-3xl p-6 sm:p-10 bg-paper-cream relative bg-paper-grid">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="w-20 h-20 bg-swaply-yellow border-3 border-swaply-black rounded-full mx-auto flex items-center justify-center text-4xl shadow-hard">
              🤝
            </div>
            <h2 className="text-3xl font-black text-swaply-black">YOU'RE REGISTERED ON SWAPLY!</h2>
            <p className="text-base font-bold text-swaply-black/80 max-w-md mx-auto">
              Welcome aboard, <span className="bg-swaply-yellow px-2 py-0.5 rounded border border-swaply-black">{name || 'Skill Swapper'}</span>! We found 18 community members ready to swap <span className="text-swaply-coral">{teachSkill}</span> for <span className="text-swaply-coral">{learnSkill}</span>!
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => navigate('/explore')}
                className="neo-btn bg-swaply-yellow text-swaply-black px-6 py-3 rounded-xl text-sm font-black shadow-hard-sm"
              >
                Explore Matches →
              </button>
            </div>
          </motion.div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1 bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black shadow-hard-sm mb-2">
                <Zap className="w-3.5 h-3.5" /> Join Swaply Community
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-swaply-black">
                Create Your Skill Swap Profile
              </h1>
              <p className="mt-2 text-sm font-bold text-swaply-black/70">
                Connect with hundreds of peer learners worldwide — completely free.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase text-swaply-black/70 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-swaply-black/70 mb-1">What can you teach?</label>
                <select
                  value={teachSkill}
                  onChange={(e) => setTeachSkill(e.target.value)}
                  className="w-full px-4 py-3.5 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                >
                  <option>React & Frontend Code</option>
                  <option>UI/UX Design & Figma</option>
                  <option>Guitar & Piano</option>
                  <option>Spanish / Japanese Language</option>
                  <option>Photography & Video Editing</option>
                  <option>Public Speaking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-swaply-black/70 mb-1">What do you want to learn?</label>
                <select
                  value={learnSkill}
                  onChange={(e) => setLearnSkill(e.target.value)}
                  className="w-full px-4 py-3.5 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                >
                  <option>UI/UX Design & Figma</option>
                  <option>React & Frontend Code</option>
                  <option>Spanish / Japanese Language</option>
                  <option>Photography & Video Editing</option>
                  <option>Guitar & Piano</option>
                  <option>Python & AI Data Science</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full neo-btn bg-swaply-yellow hover:bg-swaply-orange text-swaply-black border-3 border-swaply-black px-6 py-4 rounded-2xl text-lg font-black shadow-hard hover:shadow-hard-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Swapping Skills →</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
