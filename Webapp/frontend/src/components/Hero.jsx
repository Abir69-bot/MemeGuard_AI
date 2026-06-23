import { motion } from 'framer-motion'
import { ArrowRight, Shield } from 'lucide-react'

export default function Hero() {
  return (
    <section className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-block mb-6"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Content Detection</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight"
        >
          Detect Hateful Content
          <br />
          <span className="text-primary">in Seconds</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl text-neutral-500 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Upload an image and let our advanced AI analyze it for hateful or offensive content. Get instant results with visual explanations.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-primary text-white font-semibold rounded-2xl shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2"
          >
            Test a Meme <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-2xl hover:border-primary hover:text-primary transition-all"
          >
            See Features
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16"
        >
          <div className="text-neutral-400 text-sm">Scroll to get started</div>
        </motion.div>
      </motion.div>
    </section>
  )
}
