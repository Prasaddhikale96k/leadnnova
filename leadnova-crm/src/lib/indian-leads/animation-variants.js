'use client'

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    transition: { type: "spring", stiffness: 400, damping: 30 }
  }
}

export const slideInRight = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 30 }
}

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", stiffness: 200, damping: 20 }
}

export const tagVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  whileHover: { 
    scale: 1.08,
    borderColor: "#FF6B35",
    backgroundColor: "rgba(255,107,53,0.05)"
  },
  whileTap: { scale: 0.95 }
}

export const pulseAnimation = {
  animate: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.5, 1],
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
  }
}

export const progressShimmer = {
  animate: {
    x: ["-100%", "200%"],
    transition: { repeat: Infinity, duration: 1.5, ease: "linear" }
  }
}

export const shimmerEffect = {
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite'
}