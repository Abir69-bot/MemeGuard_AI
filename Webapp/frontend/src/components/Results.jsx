import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, ArrowLeft, Copy } from 'lucide-react'
import { useState } from 'react'

export default function Results({ data, onNewAnalysis }) {
  const [copied, setCopied] = useState(false)
  const isHateful = data.is_hateful
  const bgColor = isHateful ? 'bg-red-50' : 'bg-green-50'
  const borderColor = isHateful ? 'border-red-200' : 'border-green-200'
  const textColor = isHateful ? 'text-red-700' : 'text-green-700'
  const icon = isHateful ? AlertTriangle : CheckCircle

  const Icon = icon

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="w-full bg-gradient-to-b from-white to-neutral-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Analysis Complete</h2>
            <p className="text-neutral-500 mt-1">Here's what we found</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-neutral-200 text-neutral-700 font-medium rounded-full hover:border-primary hover:text-primary transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Analyze Another
          </motion.button>
        </motion.div>

        {/* Verdict Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`${bgColor} border-2 ${borderColor} rounded-3xl p-8 mb-8`}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className={`w-10 h-10 ${textColor}`} />
            </motion.div>
            <div>
              <h3 className={`text-2xl font-bold ${textColor}`}>
                {isHateful ? 'Hateful / Offensive' : 'Safe Content Detected'}
              </h3>
              {data.category_of_concern && data.category_of_concern !== 'None' && (
                <p className="text-sm text-neutral-600 mt-1">
                  Category: <span className="font-semibold">{data.category_of_concern}</span>
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar Animation */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={`h-1 rounded-full mt-6 ${isHateful ? 'bg-red-300' : 'bg-green-300'}`}
          />
          <p className="text-xs text-neutral-600 mt-2">Analysis Complete</p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Image - 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-soft overflow-hidden border border-neutral-100"
          >
            <div className="p-6 border-b border-neutral-100 bg-neutral-50">
              <h4 className="font-semibold text-neutral-900">Original Image</h4>
            </div>
            <div className="p-8 flex items-center justify-center min-h-96 bg-gradient-to-br from-neutral-50 to-neutral-100">
              <img
                src={data.imageUrl}
                alt="Uploaded"
                className="max-w-full max-h-96 rounded-2xl shadow-soft"
              />
            </div>
          </motion.div>

          {/* Sidebar - 1 col */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Reasoning Card */}
            <div className="bg-white rounded-3xl shadow-soft border border-neutral-100 p-6">
              <h4 className="font-semibold text-neutral-900 mb-3">Reasoning</h4>
              <p className="text-neutral-600 text-sm leading-relaxed">{data.reasoning}</p>
            </div>

            {/* Meta Cards */}
            <div className="bg-white rounded-3xl shadow-soft border border-neutral-100 p-6">
              <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Status</p>
              <p className={`font-semibold ${data.model_status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {data.model_status === 'success' ? '✓ Success' : '✗ Failed'}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-soft border border-neutral-100 p-6">
              <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Caption</p>
              <p className="font-semibold text-neutral-700">
                {data.caption_provided ? 'Provided' : 'None'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* JSON Response Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-soft border border-neutral-100 overflow-hidden"
        >
          <div className="p-6 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
            <h4 className="font-semibold text-neutral-900">API Response</h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyToClipboard}
              className="flex items-center gap-2 text-xs font-medium text-primary hover:text-secondary transition-colors"
            >
              <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>
          <div className="p-6 bg-neutral-50 overflow-auto max-h-96">
            <pre className="text-xs text-neutral-600 font-mono">
              {JSON.stringify(
                {
                  is_hateful: data.is_hateful,
                  category_of_concern: data.category_of_concern,
                  reasoning: data.reasoning,
                  caption_provided: data.caption_provided,
                  model_status: data.model_status,
                },
                null,
                2
              )}
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
