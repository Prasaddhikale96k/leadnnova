'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageSquare, FiDownload, FiTrash2, FiZap } from 'react-icons/fi'

export default function BulkActionBar({
  selectedCount,
  phoneableCount,
  onGenerateMessages,
  onExport,
  onClear
}) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="bg-gray-900 text-white rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl">
             <div className="flex items-center gap-2">
               <motion.div
                 className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold"
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ duration: 0.3 }}
                 key={selectedCount}
               >
                 {selectedCount}
               </motion.div>
               <span className="text-sm font-medium">leads selected</span>
               <span className="text-gray-400 text-xs">· {phoneableCount} have phone</span>
             </div>

            <div className="w-px h-5 bg-gray-700" />

             <div className="flex items-center gap-2">
               <motion.button
                 onClick={onGenerateMessages}
                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-sm font-medium"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
               >
                 <FiMessageSquare size={14} />
                 Generate & Send WhatsApp
               </motion.button>

              <motion.button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiDownload size={14} />
                Export
              </motion.button>
            </div>

            <div className="w-px h-5 bg-gray-700" />

            <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-200">
              Clear ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}