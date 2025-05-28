import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.header
      className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white min-h-screen flex flex-col justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: false, amount: 0.3 }}
    >
      <div className="absolute inset-0">
        <motion.div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/homepage.jpg')"
          }}
          initial={{ scale: 1.2, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: false, amount: 0.3 }}
        />
      </div>

      <nav className="absolute top-0 left-0 right-0 flex justify-between items-center px-5 py-6 z-10">
        <motion.h1
          className="text-3xl font-bold"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          TranscriptoGenie
        </motion.h1>
        <ul className="flex space-x-5">
          {['Home', 'Contact'].map((item, index) => (
            <motion.li
              key={item}
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <a
                href={`#${item.toLowerCase().replace(' ', '')}`}
                className="hover:text-blue-300 px-3 py-2 rounded transition duration-300"
              >
                {item}
              </a>
            </motion.li>
          ))}
          <motion.li
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <Link
              to="/auth"
              className="hover:text-blue-300 px-3 py-2 rounded transition duration-300"
            >
              Sign Up
            </Link>
          </motion.li>
        </ul>
      </nav>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            Efficient AI-Driven<br />Documentation
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            Transforming audio recordings into professional outputs with accuracy and speed.
          </motion.p>
          <motion.div
            className="space-x-4"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <a
              href="#services"
              className="inline-block px-8 py-4 bg-pink-600 text-white text-lg font-bold rounded-full hover:bg-pink-700 transition duration-300 transform hover:scale-105 shadow-lg"
            >
              EXPLORE SERVICES
            </a>
            <Link
              to="/auth"
              className="inline-block px-8 py-4 bg-yellow-400 text-black text-lg font-bold rounded-full hover:bg-yellow-500 transition duration-300 transform hover:scale-105 shadow-lg"
            >
              GET STARTED
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900 to-transparent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        viewport={{ once: false, amount: 0.3 }}
      />
    </motion.header>
  );
};

export default Header;