'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FC } from 'react'
import Squares from '../components/Squares'
import SplitText from "../components/SplitText";

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

const Home: FC = () => {
  return (
    <main className="min-h-screen relative bg-transparent backdrop-blur-none pointer-events-none flex items-center justify-center">
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
      <div className="flex flex-col gap-6 items-center justify-center p-4 pointer-events-auto mt-20">
      <div className="border-b-2 border-white mb-5">
      <SplitText
      text="i'm dave"
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
      <div className="border-b-2 border-white mb-10">
      <SplitText
      text="your magical personal assistant"
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

      <Image
        src="/sunlifesmalllogo.png"
        alt="Sun Life Small Logo"
        width={250}
        height={250}
        style={{ objectFit: 'contain', paddingBottom: '20px' }}
        priority
      />
        
        <div className="flex flex-col sm:flex-row gap-6">
          <Link href="/etf-picker">
            <button className="transform hover:scale-105 transition-all px-8 py-4 bg-white rounded-2xl shadow-lg text-xl font-semibold text-gray-800 hover:bg-yellow-100 w-[250px]">
              ETF Picker
            </button>
          </Link>
          
          <Link href="/insurance">
            <button className="transform hover:scale-105 transition-all px-8 py-4 bg-white rounded-2xl shadow-lg text-xl font-semibold text-gray-800 hover:bg-yellow-100 w-[250px]">
              Insurance Needs
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Home
