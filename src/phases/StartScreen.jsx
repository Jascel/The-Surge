import { useState, useEffect } from 'react'
import { useGame } from '../GameContext'
import stormBg from '../assets/msc-storm.png'
import { playSound } from '../utils/audio'

export default function StartScreen() {
  const { dispatch } = useGame()
  const [name, setName] = useState('')
  const [isLightning, setIsLightning] = useState(false)

  useEffect(() => {
    let music = playSound('startMusic', 0.4, true)

    // Browsers block autoplay until the user interacts with the page.
    // We listen for the first click or keypress to start the music if it was blocked.
    const handleInteraction = () => {
      if (music && music.paused) {
        music.play().catch(err => console.warn('Audio still blocked:', err))
      }
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    // Setup random lightning strikes
    let lightningTimeout;
    const triggerLightning = () => {
      setIsLightning(true)
      
      const thunderKey = Math.random() > 0.5 ? 'thunder1' : 'thunder2'
      playSound(thunderKey, 0.6)

      // Turn off the flash class after the animation completes (800ms)
      setTimeout(() => setIsLightning(false), 800)

      // Schedule the next lightning strike randomly between 10 and 15 seconds
      const nextStrike = Math.random() * 5000 + 10000
      lightningTimeout = setTimeout(triggerLightning, nextStrike)
    }

    // Start the first strike after a short random delay
    lightningTimeout = setTimeout(triggerLightning, Math.random() * 3000 + 2000)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
      if (music) {
        music.pause()
      }
      clearTimeout(lightningTimeout)
    }
  }, [])

  const handleStart = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'SET_NAME', payload: name.trim() })
    dispatch({ type: 'SET_PHASE', payload: 'gathering' })
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[hsl(200,15%,8%)] font-geist">
      {/* SVG Filter for distressed text */}
      <svg className="absolute w-0 h-0">
        <filter id="distress">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={stormBg}
          alt="Marshall Student Center in storm"
          className="w-full h-full object-cover object-center scale-110"
          style={{ filter: "brightness(0.35) contrast(1.3) saturate(0.4) hue-rotate(-10deg)" }}
        />
      </div>

      {/* Storm gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, hsla(100, 20%, 15%, 0.15), transparent),
            linear-gradient(180deg, hsla(200, 30%, 5%, 0.4) 0%, transparent 40%, hsla(200, 20%, 5%, 0.7) 100%)
          `,
        }}
      />

      {/* Lightning flash overlay */}
      {isLightning && (
        <div className="absolute inset-0 bg-[hsl(40,10%,75%)]/5 ss-lightning-flash pointer-events-none" />
      )}

      {/* Rain overlay */}
      <div className="absolute inset-0 ss-rain-overlay pointer-events-none" />

      {/* Vignette */}
      <div className="absolute inset-0 ss-vignette pointer-events-none" />

      {/* Scanlines */}
      <div className="absolute inset-0 ss-scanline pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title block */}
        <div className="text-center mb-12 mt-[-5vh]">
          <h1
            className="font-title text-7xl sm:text-8xl md:text-9xl tracking-widest leading-none ss-text-distressed select-none"
            style={{
              color: "hsl(40, 8%, 62%)",
              WebkitTextStroke: "1px hsla(200, 10%, 25%, 0.6)",
              letterSpacing: "0.15em",
            }}
          >
            THE SURGE
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-white/20" />
            <p
              className="font-subtitle text-xl sm:text-2xl md:text-3xl tracking-[0.5em] uppercase text-ss-amber-glow"
              style={{ opacity: 0.85 }}
            >
              USF
            </p>
            <div className="h-px w-12 bg-white/20" />
          </div>
        </div>

        {/* Terminal / Input area */}
        <div className="w-full max-w-md">
          {/* Terminal header */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-t border border-b-0 border-ss-border"
            style={{ backgroundColor: "hsla(200, 12%, 10%, 0.9)" }}
          >
            <div className="w-2 h-2 rounded-full ss-animate-flicker bg-ss-amber-glow" />
            <span className="font-geist text-xs text-ss-muted tracking-wider uppercase">
              Emergency Oracle Terminal — v2.1
            </span>
          </div>

          {/* Terminal body */}
          <div
            className="px-6 py-6 rounded-b border border-ss-border"
            style={{ backgroundColor: "hsla(200, 15%, 8%, 0.92)" }}
          >
            <p className="font-geist text-xs text-ss-muted mb-1 tracking-wide">
              &gt; SYSTEM: IDENTIFY SURVIVOR_
            </p>
            <form onSubmit={handleStart} className="mt-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter callsign..."
                maxLength={24}
                className="w-full bg-transparent border-b-2 border-white/20 focus:border-ss-primary 
                  text-[hsl(40,10%,75%)] font-geist text-lg px-1 py-2 outline-none 
                  placeholder:text-white/30 transition-colors ss-input-glow"
                autoFocus
              />
              
              <button
                type="submit"
                disabled={!name.trim()}
                className="mt-6 w-full font-subtitle text-sm tracking-[0.3em] uppercase py-3 
                  border border-ss-primary/40 rounded-sm
                  text-ss-primary hover:bg-ss-primary/10 
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-300"
              >
                Begin Transmission
              </button>
            </form>

            <p className="font-geist text-[10px] text-white/30 mt-4 text-center tracking-wider">
              NOAA ALERT: CAT-5 LANDFALL IMMINENT — ALL CHANNELS OPEN
            </p>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="font-geist text-[10px] text-white/30 space-y-1">
            <p>LAT 28.0587° N</p>
            <p>LON 82.4139° W</p>
          </div>
          <div className="font-geist text-[10px] text-white/30 text-right space-y-1">
            <p>WIND: 157 MPH</p>
            <p className="text-ss-sickly-green/80">STATUS: CRITICAL</p>
          </div>
        </div>
      </div>
    </div>
  )
}
