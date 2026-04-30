'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TypewriterPlaceholder({ phrases, interval = 3000 }) {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [wordIdx, setWordIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const currentPhrase = phrases[phraseIdx]
  const words = currentPhrase.split(' ')

  useEffect(() => {
    let timeout

    if (!isDeleting && wordIdx < words.length) {
      timeout = setTimeout(() => setWordIdx(prev => prev + 1), 150)
    } else if (!isDeleting && wordIdx === words.length) {
      timeout = setTimeout(() => setIsDeleting(true), interval)
    } else if (isDeleting && wordIdx > 0) {
      timeout = setTimeout(() => setWordIdx(prev => prev - 1), 80)
    } else if (isDeleting && wordIdx === 0) {
      setIsDeleting(false)
      setPhraseIdx(prev => (prev + 1) % phrases.length)
    }

    return () => clearTimeout(timeout)
  }, [wordIdx, isDeleting, phrases.length, interval])

  const visibleWords = words.slice(0, wordIdx)

  return (
    <span className="text-gray-400">
      {visibleWords.map((word, i) => (
        <motion.span
          key={`${phraseIdx}-${i}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {word}{' '}
        </motion.span>
      ))}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="inline-block w-[2px] h-4 bg-gray-400 ml-0.5 align-middle"
      />
    </span>
  )
}
