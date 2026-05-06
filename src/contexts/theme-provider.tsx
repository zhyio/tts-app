import { createContext, useContext, useState, useEffect, useCallback } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "dark" as Theme,
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("tts-theme") as Theme) || defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")

  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    let resolved: "light" | "dark"
    if (newTheme === "system") {
      resolved = systemDark ? "dark" : "light"
    } else {
      resolved = newTheme
    }

    root.classList.toggle("dark", resolved === "dark")
    setResolvedTheme(resolved)
  }, [])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      localStorage.setItem("tts-theme", newTheme)
      applyTheme(newTheme)
    },
    [applyTheme]
  )

  useEffect(() => {
    applyTheme(theme)

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") applyTheme("system")
    }
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [theme, applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
