import { motion } from 'framer-motion'
import { Upload, Loader, X, AlertCircle } from 'lucide-react'
import { useState, useRef } from 'react'
import axios from 'axios'

export default function Uploader({ setResult, setLoading }) {
  const [image, setImage] = useState(null)
  const [caption, setCaption] = useState('')
  const [isDrag, setIsDrag] = useState(false)
  const [loading, setLoadingLocal] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDrag(true)
  }

  const handleDragLeave = () => {
    setIsDrag(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDrag(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) {
      setImage(file)
      setError(null)
    } else {
      setError('Please drop an image file')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file?.type.startsWith('image/')) {
      setImage(file)
      setError(null)
    } else {
      setError('Please select an image file')
    }
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!image) {
      setError('Please upload an image first')
      return
    }

    setLoadingLocal(true)
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', image)
      if (caption) formData.append('caption', caption)

      console.log('Sending request to /api/analyze...')
      const response = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout
      })

      console.log('API Response:', response.data)
      setResult({
        ...response.data,
        imageUrl: URL.createObjectURL(image),
      })
    } catch (error) {
      console.error('API Error:', error)
      
      let errorMsg = 'Error analyzing image'
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      } else if (error.message === 'Network Error') {
        errorMsg = 'Cannot connect to backend. Is Flask running on http://127.0.0.1:5000?'
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Backend may be slow or offline.'
      } else if (error.message) {
        errorMsg = error.message
      }
      
      setError(errorMsg)
    } finally {
      setLoadingLocal(false)
      setLoading(false)
    }
  }

  return (
    <section className="w-full bg-gradient-to-b from-white to-neutral-50 px-4 py-20">
      <div className="max-w-2xl mx-auto">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        <motion.form
          onSubmit={handleAnalyze}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Caption Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Caption (optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter text from the meme (optional)"
              className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-700 placeholder-neutral-400 focus:bg-white focus:ring-2 focus:ring-primary focus:ring-opacity-40 focus:border-transparent transition-all"
            />
          </motion.div>

          {/* Drop Zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !image && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
              isDrag
                ? 'border-primary bg-primary/3 shadow-soft'
                : 'border-neutral-200 bg-white hover:border-primary hover:bg-neutral-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {image ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative inline-block">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="max-h-80 rounded-3xl shadow-soft"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImage(null)
                      setError(null)
                    }}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition-all shadow-soft"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm font-medium text-neutral-600">{image.name}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Upload className="w-12 h-12 text-primary mx-auto opacity-70" />
                </motion.div>
                <p className="text-neutral-700 font-medium">Drag & drop your meme here</p>
                <p className="text-sm text-neutral-500">or click to browse (JPG, PNG, GIF)</p>
              </motion.div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!image || loading}
            className="w-full py-4 bg-primary text-white font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg transition-all"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" /> Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </motion.button>

          {/* Debug Info */}
          <div className="text-xs text-neutral-400 text-center">
            Backend: http://127.0.0.1:5000 | Frontend: http://localhost:3000
          </div>
        </motion.form>
      </div>
    </section>
  )
}
