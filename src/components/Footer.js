import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-purple-700 text-white py-4">
      <motion.div 
        className="container mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        &copy; {new Date().getFullYear()} AI Meeting Minutes Generator. All rights reserved.
      </motion.div>
    </footer>
  );
};

export default Footer;