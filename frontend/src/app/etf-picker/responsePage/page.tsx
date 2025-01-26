'use client'
import { useSearchParams } from 'next/navigation'
import Squares from '../../../components/Squares'
import SplitText from '../../../components/SplitText'

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

interface ETFData {
  'ETF Name': string;
  Percentages: string[];
  'Risk Level': string;
  'Diversification Level': string;
}

interface ExposureData {
  ticker: string;
  percentage: number;
}

const parsePercentage = (percentageStr: string): ExposureData => {
  const [ticker, percentage] = percentageStr.split(':').map(s => s.trim())
  // Convert "3-5%" to average value 4
  const value = percentage.includes('-') 
    ? percentage.split('-').map(n => parseFloat(n))[0]  // Take the lower bound
    : parseFloat(percentage)
  
  return {
    ticker,
    percentage: isNaN(value) ? 0 : value
  }
}

const ExposureBarChart: React.FC<{ exposures: string[] }> = ({ exposures }) => {
  const data = exposures.map(parsePercentage)
  const maxPercentage = Math.max(...data.map(d => d.percentage))

  return (
    <div className="space-y-3 mt-4">
      {data.map((item, index) => (
        <div key={index} className="relative">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{item.ticker}</span>
            <span>{item.percentage}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{ 
                width: `${(item.percentage / maxPercentage) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const ResponsePage = () => {
  const searchParams = useSearchParams()
  const recommendation = searchParams.get('recommendation')
  const tickers = JSON.parse(searchParams.get('tickers') || '[]')

  // Parse the JSON string into structured data
  const parseRecommendation = (text: string): ETFData[] => {
    try {
      console.log('Raw text:', text) // Debug log

      // Clean up the text to get just the JSON part
      let jsonStr = text
        .replace(/```json|```/g, '') // Remove code block markers
        .replace(/\n/g, '') // Remove newlines
        .trim()

      console.log('Cleaned text:', jsonStr) // Debug log

      // Try to find JSON array between [ and ]
      const match = jsonStr.match(/\[.*\]/)
      if (match) {
        jsonStr = match[0]
      }

      console.log('Extracted JSON:', jsonStr) // Debug log

      const data = JSON.parse(jsonStr)
      console.log('Parsed data:', data) // Debug log
      return data
    } catch (error) {
      console.error('Error parsing recommendation:', error)
      console.error('Failed text:', text) // Debug log
      return []
    }
  }

  const etfs = recommendation ? parseRecommendation(recommendation) : []

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
      
      <div className="relative pt-[175px] z-10 container mx-auto py-20">
        <div className="flex flex-col items-center justify-center">
      <div className="border-b-2 border-white mb-10">
            <SplitText
            text="dave's etf recommendations"
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
        
        <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
          {etfs.map((etf, index) => (
            <div 
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{etf['ETF Name']}</h2>
              
              {/* Bar Chart */}
              <ExposureBarChart exposures={etf.Percentages} />
              
              <div className="border-t pt-4 mt-6">
                <p className="text-gray-800 font-semibold">{etf['Risk Level']}</p>
                <p className="text-gray-800 font-semibold">{etf['Diversification Level']}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-xl shadow-lg transition-colors"
          >
            back to bucket
          </button>
        </div>
      </div>
      </div>
    </main>
  )
}

export default ResponsePage 