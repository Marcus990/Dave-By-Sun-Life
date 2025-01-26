'use client'
import { FC, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Squares from '../../components/Squares'
import SplitText from '@/components/SplitText'
import { useRouter } from 'next/navigation'

interface StockResult {
  symbol: string;
  name: string;
}

const API_BASE_URL = 'http://localhost:8000';

const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
  
const ETFPicker: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<StockResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTickers, setSelectedTickers] = useState<StockResult[]>([])
  const [isBouncing, setIsBouncing] = useState(false)

  const router = useRouter()

  // Debounced search function
  useEffect(() => {
    const fetchStocks = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const TARGET_URL = `https://ticker-2e1ica8b9.now.sh/keyword/${encodeURIComponent(searchTerm)}`
        
        const response = await fetch(TARGET_URL, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin
          }
        })
        
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        
        const data = await response.json()
        console.log('Raw API Response:', data)
        
        // The API is returning the results directly as an array
        setSearchResults(data || [])
      } catch (error) {
        console.error('Detailed error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchStocks, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    scene.background = null
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(500, 500)
    
    // Adjust camera position to see full bucket
    camera.position.z = 5
    camera.position.y = -0.5 // Move camera down slightly

    // Adjust lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)  // Reduced intensity
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)  // Adjusted light position
    scene.add(directionalLight)

    let model: THREE.Group

    const controls = new OrbitControls(camera, renderer.domElement)
    // Limit controls to only rotation
    controls.enableZoom = false
    controls.enablePan = false
    controls.minPolarAngle = Math.PI / 2 - 0.5 // Limit vertical rotation
    controls.maxPolarAngle = Math.PI / 2 + 0.5
    controls.dampingFactor = 0.05
    controls.enableDamping = true

    // Load Model with material modifications
    const loader = new GLTFLoader()
    loader.load(
      '/yellowbucketmodel.glb',
      (gltf) => {
        model = gltf.scene
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xFFD700,
              metalness: 0.3,
              roughness: 0.4,
            })
          }
        })
        model.scale.set(1.75, 1.75, 1.75)
        model.position.set(0, -0.5, 0)
        scene.add(model)
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    )

    // Animation loop with rotation
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      scene.clear()
      renderer.dispose()
    }
  }, [])

  const handleTickerSelect = (ticker: StockResult) => {
    // Check if ticker already exists in the list
    if (!selectedTickers.some(t => t.symbol === ticker.symbol)) {
      setSelectedTickers([...selectedTickers, ticker])
      // Trigger bounce animation
      setIsBouncing(true)
      setTimeout(() => setIsBouncing(false), 1000) // Reset after animation
    }
    setSearchTerm('')
    setSearchResults([])
  }

  // Add these keyframe styles at the top of your component
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes bucketBounce {
        0%, 100% { transform: translateY(0); }
        20% { transform: translateY(20px) rotate(-5deg); }
        40% { transform: translateY(10px) rotate(3deg); }
        60% { transform: translateY(15px) rotate(-3deg); }
        80% { transform: translateY(5px) rotate(2deg); }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handleAskDave = async () => {
    if (selectedTickers.length === 0) {
      alert('Please select some tickers first!')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/etfs/ask-dave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          tickers: selectedTickers
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response not OK:', response.status, errorText)
        throw new Error(`Failed to get recommendation: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Received recommendation:', data)
      
      router.push(`/etf-picker/responsePage?recommendation=${encodeURIComponent(data.recommendation)}&tickers=${encodeURIComponent(JSON.stringify(selectedTickers))}`)
    } catch (error) {
      console.error('Detailed error:', error)
      alert('Failed to get recommendation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen relative overflow-auto bg-black">
      <div className="fixed inset-0 z-0">
        <Squares
          lineColor="#fff"
          backgroundColor="rgba(255, 255, 0, 0.2)"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
      </div>
      <div className="relative z-10 min-h-screen pt-[175px] pb-20">
        <div className="container mx-auto flex flex-col items-center">
          <div className="mb-[50px] border-b-2 border-white">
            <SplitText
              text="your investment bucket"
              className="text-7xl text-white font-semibold text-center py-2"
              delay={150}
              animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
              animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
              easing="easeOutCubic"
              threshold={0.2}
              rootMargin="-50px"
              onLetterAnimationComplete={handleAnimationComplete}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row items-start justify-center space-x-12">
              {/* Bucket Column */}
              <div className="flex flex-col items-center">
                <div 
                  className={`w-[500px] h-[500px] flex items-center justify-center transition-all ${
                    isBouncing ? 'animate-[bucketBounce_1s_ease-in-out]' : ''
                  }`}
                >
                  <canvas ref={canvasRef} className="w-full h-full" />
                </div>
              </div>

              {/* Search and Tickers Column */}
              <div className="flex flex-col w-[400px]">
                {/* Search Section */}
                <div className="relative mb-20">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-4 pr-12 text-lg rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg"
                      placeholder="Search stock tickers... (e.g., AAPL)"
                    />
                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {isLoading ? '⌛' : '🔍'}
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute w-full mt-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl max-h-60 overflow-y-auto border border-gray-200 z-50">
                      {searchResults.map((result) => (
                        <div
                          key={result.symbol}
                          className="p-4 hover:bg-yellow-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleTickerSelect(result)}
                        >
                          <div className="font-bold text-lg text-gray-800">{result.symbol}</div>
                          <div className="text-sm text-gray-600">{result.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tickers List */}
                <div className="w-full mb-5">
                  <h3 className="text-white text-center text-xl font-semibold mb-2">tickers in your bucket</h3>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 min-h-[100px]">
                    {selectedTickers.length === 0 ? (
                      <p className="text-gray-500 text-center">No tickers selected yet</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTickers.map((ticker) => (
                          <div 
                            key={ticker.symbol}
                            className="flex justify-between items-center bg-yellow-50 rounded-lg p-3"
                          >
                            <div>
                              <div className="font-bold text-gray-800">{ticker.symbol}</div>
                              <div className="text-sm text-gray-600">{ticker.name}</div>
                            </div>
                            <button 
                              onClick={() => setSelectedTickers(prev => prev.filter(t => t.symbol !== ticker.symbol))}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Ask Dave Button */}
            <div className="w-full flex justify-center">
              <button 
                className="relative left-[30%] px-12 py-4 bg-white hover:bg-gray-100 text-black text-xl font-bold rounded-2xl shadow-xl transition-colors"
                onClick={handleAskDave}
              >
                {isLoading ? 'thinking...' : 'ask dave'}
              </button>
            </div>
          </div>
          <div className="absolute left-[23%] bottom-[8%] mb-[50px] border-b-2 border-white">
                <SplitText
                text='"what etf should i buy?"'
                className="text-3xl text-white font-semibold text-center py-2"
                delay={150}
                animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                easing="easeOutCubic"
                threshold={0.2}
                rootMargin="-50px"
                onLetterAnimationComplete={handleAnimationComplete}
                />
            </div>
        </div>
      </div>
    </main>
  )
}

export default ETFPicker 