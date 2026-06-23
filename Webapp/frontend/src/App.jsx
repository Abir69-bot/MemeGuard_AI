import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Uploader from './components/Uploader'
import Results from './components/Results'
import Footer from './components/Footer'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {!result ? (
          <>
            <Hero />
            <Uploader setResult={setResult} setLoading={setLoading} />
          </>
        ) : (
          <Results data={result} onNewAnalysis={() => setResult(null)} />
        )}
      </main>
      <Footer />
    </div>
  )
}
