import { useEffect, useMemo, useRef } from 'react'

const SOUNDS = {
  buttonPress: '/sounds/FX/button press.mp3',
  mapNode: '/sounds/FX/map node.mp3',
  openDispatcher: '/sounds/FX/open dispatcher.mp3',
  dispatcherStatic: '/sounds/FX/dispatcher static.mp3',
  takeItem: '/sounds/FX/take item.mp3',
  gameOver: '/sounds/FX/game over.mp3',
  win: '/sounds/FX/win.mp3',
  windStage1: '/sounds/stage winds/stage 1.mp3',
  windStage2: '/sounds/stage winds/stage 2.mp3',
  windStage3: '/sounds/stage winds/stage 3.mp3',
  windGauntlet: '/sounds/stage winds/gauntlet.mp3',
}

const audioCache = {}

export const playSound = (soundKey, volume = 0.5, loop = false) => {
  const src = SOUNDS[soundKey]
  if (!src) return null

  const audio = new Audio(src)
  audio.volume = volume
  audio.loop = loop
  
  // Ensure background sounds (looping) don't get interrupted
  if (loop) {
    audio.addEventListener('ended', () => {
      if (audio.loop) {
        audio.currentTime = 0
        audio.play().catch(err => console.warn(`Audio loop restart failed for ${soundKey}:`, err))
      }
    })
  }

  audio.play().catch(err => console.warn(`Audio play failed for ${soundKey}:`, err))
  return audio
}

function getWindKey(phase, timeUntilLandfall) {
  if (phase === 'gathering') {
    if (timeUntilLandfall > 8) return 'windStage1'
    if (timeUntilLandfall > 4) return 'windStage2'
    return 'windStage3'
  }
  if (phase === 'sprint' || phase === 'gauntlet') return 'windGauntlet'
  return null
}

export const useWindSounds = (phase, timeUntilLandfall) => {
  const audioRef = useRef(null)
  const soundKey = useMemo(() => getWindKey(phase, timeUntilLandfall), [phase, timeUntilLandfall])

  useEffect(() => {
    if (soundKey) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const audio = playSound(soundKey, 0.3, true)
      if (audio) {
        audioRef.current = audio
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [soundKey])
}
