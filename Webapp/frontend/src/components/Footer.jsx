import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-12 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-soft"></div>
              <span className="font-bold text-neutral-900">MemeGuard</span>
            </div>
            <p className="text-sm text-neutral-500">
              AI-powered content safety for the modern web.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'API', 'Docs'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-500 hover:text-primary transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-500 hover:text-primary transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Connect</h4>
            <div className="flex gap-3">
              {['GitHub', 'Twitter', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center bg-neutral-50 hover:bg-primary hover:text-white text-neutral-600 rounded-lg transition-all shadow-soft"
                >
                  <span className="text-xs font-semibold">{social[0]}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-neutral-100 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500"
        >
          <p>&copy; 2025 MemeGuard. All rights reserved.</p>
          <p>Built with React, Tailwind & AI</p>
        </motion.div>
      </div>
    </footer>
  )
}
