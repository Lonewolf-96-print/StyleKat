"use client"
import { motion } from "framer-motion"
import { Card } from "../components/ui/card"

export default function SeatCard({ seat, children }) {

  // FIXED VALIDATION (remove seat.status requirement)
  if (!seat || !seat.name) {
    return (
      <div className="p-4 border rounded bg-red-100 text-red-700">
        Invalid Seat Data
      </div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full flex flex-col bg-background rounded-t-[3rem] rounded-b-xl border-4 border-muted shadow-xl overflow-hidden relative group">

        {/* 🪞 MIRROR / HEADER */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4 text-center border-b-4 border-gray-700 relative shadow-inner">
          {/* Glossy reflection effect */}
          <div className="absolute top-0 right-0 w-full h-1/2 bg-white/5 skew-y-6 pointer-events-none"></div>

          <h3 className="font-bold text-lg tracking-wide text-shadow-sm">{seat.name}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{seat.role}</p>
        </div>

        {/* 💺 CHAIR / BODY */}
        <div className="flex-1 p-5 flex flex-col gap-4 bg-gradient-to-b from-gray-50 to-white relative">

          {/* Arms of the chair (Visual decorations) */}
          <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-r from-gray-200 to-transparent opacity-50"></div>
          <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-l from-gray-200 to-transparent opacity-50"></div>

          {/* Main Content (Customer/Queue) */}
          {children}
        </div>

        {/* 🦶 FOOTREST */}
        <div className="h-4 bg-gray-800 border-t-2 border-gray-600 mx-8 rounded-b-md mb-1 opacity-80"></div>
      </div>
    </motion.div>
  )
}
