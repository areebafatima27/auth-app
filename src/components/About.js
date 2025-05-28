import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="relative py-24 px-6 bg-gradient-to-b from-gray-50 via-purple-50 to-white overflow-hidden">
      {/* Professional background blobs with purple colors */}
      <div
        className="absolute top-[-5rem] left-[-5rem] w-[22rem] h-[22rem] rounded-full opacity-40 blur-[100px] -z-10"
        style={{ backgroundColor: '#7c3aed' }}
      />
      <div
        className="absolute top-1/3 right-[-4rem] w-[18rem] h-[18rem] rounded-full opacity-40 blur-[100px] -z-10"
        style={{ backgroundColor: '#9333ea' }}
      />
      <div
        className="absolute bottom-[-4rem] left-[30%] w-[20rem] h-[20rem] rounded-full opacity-30 blur-[120px] -z-10"
        style={{ backgroundColor: '#c4b5fd' }}
      />

      {/* Heading */}
      <motion.h2
        className="text-5xl font-extrabold mb-16 text-center text-purple-700"
        initial={{ opacity: 0, y: -60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: false, amount: 0.3 }}
      >
        About Us
      </motion.h2>

      <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-14 max-w-7xl mx-auto relative z-10 px-4">
        {/* Text Block with purple border */}
        <motion.div
          className="md:w-1/2 bg-white/80 hover:bg-white p-8 rounded-3xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border-4 border-purple-600"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <p className="text-lg text-gray-800 leading-relaxed mb-4 transition duration-300">
            <span className="font-bold text-purple-600">TranscriptoGenie</span> offers advanced AI-driven tools for fast and accurate <span className="text-purple-700 font-semibold">audio transcription</span>, intelligent <span className="text-purple-700 font-semibold">summarization</span>, <span className="text-purple-700 font-semibold">Speaker Identification</span>, and seamless <span className="text-purple-700 font-semibold">language translation</span>.
          </p>
          <p className="text-gray-700 transition duration-300">
            Whether you're a <span className="text-purple-700 font-semibold">podcaster, journalist, student, or business professional</span>, we help transform your conversations into polished, shareable content—<span className="text-purple-700 font-semibold">effortlessly.</span>
          </p>
        </motion.div>

        {/* Image Block */}
        <motion.div
          className="md:w-1/2 group"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <img
            src="/images/aboutus.jpg"
            alt="AI transcription illustration"
            className="rounded-3xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default About;