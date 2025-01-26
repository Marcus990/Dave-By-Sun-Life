import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  return (
    <header className="rounded-b-3xl bg-white/90 backdrop-blur-sm shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-2">
          {/* Logo and Company Name */}
          <div className="flex items-center space-x-4">
            <div className="w-[150px] h-[100px] relative flex items-center justify-center">
              <Image
                src="/sunlifelogo.png"
                alt="Sun Life Logo"
                width={150}
                height={150}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              className="text-gray-600 hover:text-yellow-500 transition-colors"
            >
              home
            </Link>
            <Link 
              href="/about"
              className="text-gray-600 hover:text-yellow-500 transition-colors"
            >
              about
            </Link>
            <Link 
              href="/contact"
              className="text-gray-600 hover:text-yellow-500 transition-colors"
            >
              contact us
            </Link>
            <button className="bg-yellow-400 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
              login
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 