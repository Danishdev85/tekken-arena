import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, confirmLabel, onConfirm, danger = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-t-lg border border-line bg-card p-5 shadow-2xl sm:rounded-md"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-fog">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-sm p-1 text-ash transition-colors hover:bg-panel hover:text-fog"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-sm text-ash">{children}</div>
            {(onConfirm || onClose) && (
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={onClose}
                  className="rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-fog transition-colors hover:border-ash"
                >
                  Cancel
                </button>
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    className={`rounded-md px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 ${
                      danger ? 'bg-blood' : 'bg-ember'
                    }`}
                  >
                    {confirmLabel || 'Confirm'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
