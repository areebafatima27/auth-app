import React from 'react';
import { motion } from 'framer-motion';

const ServiceCard = ({ image, title, description, index }) => (
  <motion.div
    className="bg-white/80 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-500 transform hover:-translate-y-1 border-4 border-purple-600"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.3 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <div className="relative overflow-hidden rounded-2xl mb-6 group h-40 flex items-center justify-center bg-gray-100">
      <img
        src={image}
        alt={title}
        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
      <motion.div
        className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ y: 20 }}
        whileHover={{ y: 0 }}
      >
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm">{description}</p>
      </motion.div>
    </div>
    <h3 className="text-xl font-semibold mb-2 group-hover:opacity-0 transition-opacity duration-300 text-purple-900">
      {title}
    </h3>
    <p className="text-purple-700 group-hover:opacity-0 transition-opacity duration-300">{description}</p>
  </motion.div>
);

const Services = () => {
  const services = [
    {
      image: "/images/audio.jpg",
      title: "Audio Transcription",
      description: "Convert spoken content into written text accurately and efficiently."
    },
    {
      image: "/images/summary.jpg",
      title: "Content Summarization",
      description: "Generate concise summaries and highlight critical points from recordings."
    },
    {
      image: "/images/speaker_identification.jpg",
      title: "Speaker Identification",
      description: "Identify multiple speakers for clear and organized documentation."
    },
    {
      image: "/images/translation.jpg",
      title: "Urdu-to-English Translation",
      description: "Translate Urdu recordings into English for bilingual accessibility."
    }
  ];

  return (
    <section
      id="services"
      className="relative py-24 px-6 bg-gradient-to-b from-gray-50 via-purple-50 to-white overflow-hidden"
    >
      {/* Background blobs with purple tones */}
      <div className="absolute top-[-5rem] left-[-5rem] w-[22rem] h-[22rem] bg-purple-100 rounded-full opacity-40 blur-[100px] -z-10" />
      <div className="absolute top-1/3 right-[-4rem] w-[18rem] h-[18rem] bg-purple-200 rounded-full opacity-40 blur-[100px] -z-10" />
      <div className="absolute bottom-[-4rem] left-[30%] w-[20rem] h-[20rem] bg-purple-50 rounded-full opacity-30 blur-[120px] -z-10" />

      <div className="container mx-auto max-w-7xl">
        <motion.h2
          className="text-5xl font-extrabold mb-16 text-center text-purple-700"
          initial={{ opacity: 0, y: -60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          Our Services
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-4">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;