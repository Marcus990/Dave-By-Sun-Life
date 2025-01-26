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

const ETFPicker: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<StockResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTickers, setSelectedTickers] = useState<StockResult[]>([])
  const [isBouncing, setIsBouncing] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [investmentAmount, setInvestmentAmount] = useState<string>('')
  const [showAccountModal, setShowAccountModal] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const router = useRouter()

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
  
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

  const handleTickerSelect = (ticker: StockResult) => {
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
        20% { transform: translateY(20px) rotate(-10deg); }
        40% { transform: translateY(10px) rotate(7deg); }
        60% { transform: translateY(15px) rotate(-5deg); }
        80% { transform: translateY(5px) rotate(2deg); }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Track button position
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setButtonPosition({
          x: rect.left,
          y: rect.top
        })
      }
    }

    // Initial position
    updatePosition()

    // Update position on resize and scroll
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)
    
    // Create an observer to watch for height changes in the ticker list
    const observer = new ResizeObserver(updatePosition)
    if (buttonRef.current) {
      observer.observe(buttonRef.current.parentElement || buttonRef.current)
    }

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
      observer.disconnect()
    }
  }, [selectedTickers.length]) // Re-run when ticker list changes

  const handleAskDave = async () => {
    if (selectedTickers.length === 0) {
      alert('Please select some tickers first!')
      return
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      alert('Please enter a valid investment amount!')
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
          tickers: selectedTickers,
          investmentAmount: parseFloat(investmentAmount)
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

  // Add this useEffect for the bucket setup
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
    
    camera.position.z = 5
    camera.position.y = -0.5

    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.minPolarAngle = Math.PI / 2 - 0.5
    controls.maxPolarAngle = Math.PI / 2 + 0.5
    controls.dampingFactor = 0.05
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 2

    // Load bucket model
    const loader = new GLTFLoader()
    loader.load(
      '/yellowbucketmodel.glb',
      (gltf) => {
        const model = gltf.scene
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.name.toLowerCase().includes('handle') || child.position.y > 0) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                metalness: 0.3,
                roughness: 0.4,
              })
            } else {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                metalness: 0.3,
                roughness: 0.4,
              })
            }
          }
        })
        model.scale.set(1.75, 1.75, 1.75)
        model.position.set(0, -0.5, 0)
        scene.add(model)
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    )

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      scene.clear()
      renderer.dispose()
    }
  }, [])

  return (
    <main className="min-h-screen relative overflow-auto bg-black">
      {/* Account Selection Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-20 shadow-xl max-w-md w-full mx-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 pb-6">
              where do you plan on investing?
            </h2>
            <div className="grid grid-cols-1 gap-4 items-center justify-center">
              {['TFSA', 'FHSA', 'RESP', 'RRSP'].map((account) => (
                <button
                  key={account}
                  onClick={() => {
                    setSelectedAccount(account)
                    setShowAccountModal(false)
                    setShowSuccessModal(true)
                  }}
                  className="w-full p-6 text-xl font-semibold text-gray-800 bg-gray-100 hover:bg-yellow-100 
                    rounded-xl transition-colors duration-200"
                >
                  {account}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Message Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-12 shadow-xl max-w-md w-full mx-8 text-center relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              {selectedAccount === 'TFSA' && 'good choice! investing early for your future is smart!'}
              {selectedAccount === 'FHSA' && 'great choice! saving early for your first home is smart!'}
              {selectedAccount === 'RESP' && 'wonderful choice! investing in your education will lead to success!'}
              {selectedAccount === 'RRSP' && 'incredible choice! planning ahead for retirement is crucial for success!'}
            </h2>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-8 py-3 bg-gray-100 hover:bg-yellow-100 text-gray-800 font-semibold rounded-xl transition-colors duration-200"
            >
              continue
            </button>
          </div>
        </div>
      )}

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
          
          {/* Add the account type display */}
          {selectedAccount && (
            <div className="absolute top-[150px] left-8">
              <div className="px-8 py-2 bg-white hover:bg-gray-100 text-black text-2xl font-bold rounded-2xl shadow-xl">
                {selectedAccount}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row items-start justify-center space-x-12">
              {/* Bucket Column */}
              <div className="flex flex-col items-center">
                <div 
                  className={`w-[500px] h-[500px] flex items-center justify-center transition-all relative
                    ${isBouncing ? 'animate-[bucketBounce_1s_ease-in-out]' : ''}`}
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
                      placeholder="search stock tickers... (e.g., AAPL)"
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
                <div className="w-full mb-8">
                  <h3 className="text-white text-center text-2xl font-semibold mb-2">bucket list</h3>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 min-h-[100px]">
                    {selectedTickers.length === 0 ? (
                      <p className="text-gray-500 text-center">no tickers selected yet</p>
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

                {/* Investment Amount Input */}
                <div className="w-full mb-8">
                  <h3 className="text-white text-center text-2xl font-semibold mb-2">investment amount</h3>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="text"
                      value={investmentAmount}
                      onChange={(e) => {
                        // Only allow numbers and decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, '')
                        // Prevent multiple decimal points
                        if (value.split('.').length <= 2) {
                          setInvestmentAmount(value)
                        }
                      }}
                      className="w-full p-4 pl-8 text-lg rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg"
                      placeholder="enter amount..."
                    />
                  </div>
                </div>

                {/* Ask Dave Button and Quote - Moved inside the search column */}
                <div className="flex flex-col items-center mt-4">
                  <button 
                    ref={buttonRef}
                    className="px-12 py-4 bg-white hover:bg-gray-100 text-black text-xl font-bold rounded-2xl shadow-xl transition-colors"
                    onClick={handleAskDave}
                  >
                    {isLoading ? 'thinking...' : 'ask dave'}
                  </button>
                </div>
              </div>
            </div>
            <div 
              className="border-b-2 border-white absolute transition-all duration-300"
              style={{ 
                top: `${buttonPosition.y+15}px`,
                left: '23%',
                zIndex: 20
              }}
            >
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
      </div>
    </main>
  )
}

export default ETFPicker 