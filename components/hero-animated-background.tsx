"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import {
  IconBox,
  IconBrandAdobe,
  IconBrandOpenai,
  IconBrandSlack,
  IconBrandAppgallery,
} from "@tabler/icons-react"
import { useTheme } from "next-themes"

const brands = [
  { name: "netflix", color: "E50914" },
  { name: "spotify", color: "1DB954" },
  { name: "figma", color: "F24E1E" },
  { name: "slack", color: "4A154B", Icon: IconBrandSlack },
  { name: "discord", color: "5865F2" },
  { name: "notion", color: "000000", invertOnDark: true },
  { name: "stripe", color: "008CDD" },
  { name: "adobe", color: "FF0000", Icon: IconBrandAdobe },
  { name: "github", color: "181717", invertOnDark: true },
  {
    name: "openai",
    color: "412991",
    invertOnDark: true,
    Icon: IconBrandOpenai,
  },
  { name: "canva", color: "00C4CC", Icon: IconBrandAppgallery },
  { name: "trello", color: "0052CC" },
  { name: "youtube", color: "FF0000" },
]

export function HeroAnimatedBackground() {
  const controls = useAnimation()
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    let isActive = true

    // Use percentage of container to spread correctly, bounded by 1200px max width for safety
    const getWidth = () => Math.min(window.innerWidth * 0.85, 1100)
    const getHeight = () => Math.min(window.innerHeight * 0.7, 600)
    const getRandomX = () => (Math.random() - 0.5) * getWidth()
    const getRandomY = () => (Math.random() - 0.5) * getHeight()

    const runAnimation = async () => {
      while (isActive) {
        // 1. Float randomly around the whole hero background
        await controls.start((i) => ({
          x: getRandomX(),
          y: getRandomY(),
          scale: Math.random() * 0.4 + 0.8,
          opacity: 0.6,
          rotate: Math.random() * 40 - 20,
          transition: { duration: 6, ease: "easeInOut" },
        }))

        if (!isActive) break

        // 2. Keep floating to another position
        await controls.start((i) => ({
          x: getRandomX(),
          y: getRandomY(),
          scale: Math.random() * 0.4 + 0.8,
          opacity: 0.5,
          rotate: Math.random() * 40 - 20,
          transition: { duration: 6, ease: "easeInOut" },
        }))

        if (!isActive) break

        // 3. Gather into the central "Box" (Zip)
        await controls.start({
          x: 0,
          y: 0,
          scale: 0.1, // shrink as they enter the box
          opacity: 0,
          rotate: 0,
          transition: { duration: 1.5, ease: "backInOut" },
        })

        if (!isActive) break

        // 4. Burst and Pop back out cleanly
        await controls.start((i) => ({
          x: getRandomX(),
          y: getRandomY(),
          scale: Math.random() * 0.4 + 0.8,
          opacity: 0.6,
          rotate: Math.random() * 90 - 45,
          transition: { duration: 2, ease: "easeOut" },
        }))
      }
    }

    runAnimation()

    return () => {
      isActive = false
      controls.stop()
    }
  }, [controls, mounted])

  if (!mounted) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
      <div className="relative flex h-full w-full max-w-6xl items-center justify-center">
        {/* The central "Box" or Zip that icons go into */}
        <motion.div
          className="absolute z-0 text-indigo-500/20 dark:text-indigo-400/10"
          initial={{ scale: 1, opacity: 0.2 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconBox size={180} stroke={0.5} />
        </motion.div>

        {brands.map((brand, i) => {
          let logoColor = brand.color
          if (resolvedTheme === "dark" && brand.invertOnDark) {
            logoColor = "FFFFFF"
          }

          return (
            <motion.div
              key={i}
              custom={i}
              animate={controls}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
              }}
              className="absolute z-10"
            >
              {brand.Icon ? (
                <brand.Icon
                  className="h-10 w-10 opacity-80 drop-shadow-md sm:h-12 sm:w-12 md:h-14 md:w-14 dark:opacity-90 dark:drop-shadow-none"
                  color={`#${logoColor}`}
                  stroke={1.5}
                />
              ) : (
                <img
                  src={`https://cdn.simpleicons.org/${brand.name}/${logoColor}`}
                  alt={`${brand.name} logo`}
                  className="h-10 w-10 opacity-80 drop-shadow-md sm:h-12 sm:w-12 md:h-14 md:w-14 dark:opacity-90 dark:drop-shadow-none"
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
