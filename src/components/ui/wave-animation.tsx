import { motion } from "framer-motion"

interface WaveAnimationProps {
  className?: string
  barCount?: number
}

export function WaveAnimation({ className, barCount = 5 }: WaveAnimationProps) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className ?? ""}`}>
      {Array.from({ length: barCount }, (_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-primary"
          animate={{ height: [8, 32, 8] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
