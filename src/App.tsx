import { useState } from "react"
import { motion } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from "@/components/layout/header"
import { ConfigDrawer } from "@/components/config/config-drawer"
import { HomePage } from "@/pages/home-page"

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground bg-glow">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Header onOpenSettings={() => setSettingsOpen(true)} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <HomePage />
        </motion.div>

        <ConfigDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </TooltipProvider>
  )
}

export default App
