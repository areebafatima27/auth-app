import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <section
      id="contact"
      className="relative py-24 px-6 bg-gradient-to-b from-gray-50 via-purple-50 to-white overflow-hidden"
    >
      {/* Background blobs */}
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
          Contact Us
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-10 px-4">
          <motion.div
            className="w-full lg:w-5/12 bg-white/80 p-8 rounded-3xl shadow-xl border-4 border-purple-600 hover:border-purple-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <form>
              <div className="mb-5">
                <label
                  className="block text-sm font-semibold text-purple-700 mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Enter Your Name"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition"
                />
              </div>
              <div className="mb-5">
                <label
                  className="block text-sm font-semibold text-purple-700 mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="Enter Your Email"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition"
                />
              </div>
              <div className="mb-5">
                <label
                  className="block text-sm font-semibold text-purple-700 mb-2"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  placeholder="Write Your Message"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition"
                ></textarea>
              </div>
              <motion.button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            className="w-full lg:w-5/12 bg-white/80 p-8 rounded-3xl shadow-xl border-4 border-purple-600 hover:border-purple-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold text-purple-700 mb-4">
              Get in Touch
            </h3>
            <p className="text-purple-700 mb-3 flex items-center">📍 Lahore College for Women University</p>
            <p className="text-purple-700 mb-3 flex items-center">📧 info@docuai.com</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;