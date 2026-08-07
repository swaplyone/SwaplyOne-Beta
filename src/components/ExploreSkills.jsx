import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Filter, Code, Palette, Camera, Video, Music, Globe, Mic, TrendingUp, Dumbbell, Utensils, Database, ArrowRight, Heart } from 'lucide-react';

export default function ExploreSkills({ onOpenJoinModal }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSticker, setActiveSticker] = useState(null);

  const skills = [
    { name: "Programming & React", category: "Tech", icon: Code, color: "bg-swaply-yellow", rotation: "rotate-[-2deg]", teachers: 240, learners: 510 },
    { name: "UI/UX & Figma", category: "Design", icon: Palette, color: "bg-swaply-mint", rotation: "rotate-[3deg]", teachers: 180, learners: 420 },
    { name: "Portrait Photography", category: "Creative", icon: Camera, color: "bg-swaply-coral", rotation: "rotate-[-1.5deg]", teachers: 120, learners: 310 },
    { name: "Video Reel Editing", category: "Creative", icon: Video, color: "bg-swaply-purple/30", rotation: "rotate-[2deg]", teachers: 150, learners: 390 },
    { name: "Guitar & Piano", category: "Music", icon: Music, color: "bg-swaply-blue/30", rotation: "rotate-[-3deg]", teachers: 95, learners: 280 },
    { name: "Spanish & Japanese", category: "Languages", icon: Globe, color: "bg-swaply-pink/30", rotation: "rotate-[1.5deg]", teachers: 310, learners: 620 },
    { name: "Public Speaking", category: "Lifestyle", icon: Mic, color: "bg-swaply-orange/30", rotation: "rotate-[-2deg]", teachers: 85, learners: 210 },
    { name: "Growth Marketing", category: "Tech", icon: TrendingUp, color: "bg-swaply-yellow", rotation: "rotate-[2.5deg]", teachers: 140, learners: 290 },
    { name: "Fitness Coaching", category: "Lifestyle", icon: Dumbbell, color: "bg-swaply-mint", rotation: "rotate-[-1deg]", teachers: 110, learners: 240 },
    { name: "Sourdough Baking", category: "Lifestyle", icon: Utensils, color: "bg-swaply-coral", rotation: "rotate-[3deg]", teachers: 65, learners: 180 },
    { name: "Python & AI Data", category: "Tech", icon: Database, color: "bg-swaply-purple/30", rotation: "rotate-[-2.5deg]", teachers: 290, learners: 580 },
  ];

  const categories = ['All', 'Tech', 'Design', 'Creative', 'Music', 'Languages', 'Lifestyle'];

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="explore-skills" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 bg-swaply-purple/20 border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black shadow-hard-sm mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Explore The Swaply Universe
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-swaply-black tracking-tight">
          What Do You Want To <span className="bg-swaply-yellow border-2 border-swaply-black px-2 py-0.5 rounded-xl shadow-hard-sm">Learn Today?</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg font-bold text-swaply-black/70">
          Over 50+ skill stickers scattered across the community. Hover, click, and match!
        </p>
      </div>

      {/* SEARCH & CATEGORY FILTER BAR */}
      <div className="bg-paper-card border-3 border-swaply-black rounded-3xl p-4 sm:p-6 shadow-hard mb-10 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-swaply-black/60" />
            <input
              type="text"
              placeholder="Search skills (e.g., React, Spanish, Photography)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-paper-cream border-2 border-swaply-black rounded-2xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
            />
          </div>

          {/* CATEGORY PILLS */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-1/2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border-2 ${
                  selectedCategory === cat
                    ? 'bg-swaply-black text-white border-swaply-black shadow-hard-sm'
                    : 'bg-paper-cream text-swaply-black border-swaply-black hover:bg-swaply-yellow'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* SKILL STICKERS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 min-h-[300px]">
        {filteredSkills.map((skill, idx) => {
          const Icon = skill.icon;
          const isHovered = activeSticker === skill.name;

          return (
            <motion.div
              key={skill.name}
              onMouseEnter={() => setActiveSticker(skill.name)}
              onMouseLeave={() => setActiveSticker(null)}
              whileHover={{ scale: 1.08, rotate: 0 }}
              whileTap={{ scale: 0.95 }}
              className={`neo-card rounded-2xl p-4 cursor-pointer relative ${skill.color} ${skill.rotation} transition-all duration-200 flex flex-col justify-between`}
            >
              {/* STICKER HEADER */}
              <div className="flex items-center justify-between mb-2">
                <span className="bg-swaply-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {skill.category}
                </span>
                <Icon className="w-5 h-5 text-swaply-black" />
              </div>

              {/* SKILL NAME */}
              <h3 className="font-extrabold text-sm sm:text-base text-swaply-black leading-snug">
                {skill.name}
              </h3>

              {/* STATS FOOTER */}
              <div className="mt-3 pt-2 border-t-2 border-swaply-black/15 flex items-center justify-between text-[11px] font-bold text-swaply-black/70">
                <span>{skill.teachers} Teachers</span>
                <span className="flex items-center gap-0.5 text-swaply-black">
                  <Heart className="w-3 h-3 fill-swaply-coral text-swaply-coral" /> {skill.learners}
                </span>
              </div>

              {/* POP-UP STICKER BADGE ON HOVER */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: -20 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-swaply-yellow border-2 border-swaply-black px-2.5 py-0.5 rounded-full shadow-hard-sm text-[10px] font-black whitespace-nowrap z-20"
                >
                  ⚡ Match Available!
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* CALL TO ACTION BUTTON */}
      <div className="mt-12 text-center">
        <button
          onClick={onOpenJoinModal}
          className="neo-btn bg-swaply-yellow hover:bg-swaply-orange text-swaply-black px-8 py-4 rounded-2xl text-lg font-black shadow-hard-lg hover:shadow-hard-xl transition-all inline-flex items-center gap-2 group"
        >
          <span>Find Your Skill Match</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </section>
  );
}
