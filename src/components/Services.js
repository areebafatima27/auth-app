import React from 'react';
import { motion } from 'framer-motion';

const ServiceCard = ({ image, title, description, index }) => (
  <motion.div 
    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <div className="relative overflow-hidden rounded-lg mb-6 group">
      <img src={image} alt={title} className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110" />
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
    <h3 className="text-xl font-semibold mb-2 group-hover:opacity-0 transition-opacity duration-300">{title}</h3>
    <p className="text-gray-600 group-hover:opacity-0 transition-opacity duration-300">{description}</p>
  </motion.div>
);

const Services = () => {
  const services = [
    {
      image: "audio transcription.jpeg",
      title: "Audio Transcription",
      description: "Convert spoken content into written text accurately and efficiently."
    },
    {
      image: "summarizaion.png",
      title: "Content Summarization",
      description: "Generate concise summaries and highlight critical points from recordings."
    },
    {
      image: "speaker identification.jpeg",
      title: "Speaker Identification",
      description: "Identify multiple speakers for clear and organized documentation."
    },
    {
      image: "Urdu-Trans-Logo.png",
      title: "Urdu-to-English Translation",
      description: "Translate Urdu recordings into English for bilingual accessibility."
    }
  ];

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-purple-100 to-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold mb-16 text-center text-purple-800"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Services
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
