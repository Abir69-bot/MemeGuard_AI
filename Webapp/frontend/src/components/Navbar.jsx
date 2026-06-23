import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="text-lg font-semibold text-neutral-900">MemeGuard</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-full shadow-soft hover:shadow-soft-lg transition-all"
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </nav>
  )
}
