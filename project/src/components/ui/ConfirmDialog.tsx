import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-neutral-950 border border-neutral-800 p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-start gap-4">
              {variant === 'danger' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm tracking-[0.1em] uppercase mb-2">{title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">{message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-xs tracking-widest uppercase border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors disabled:opacity-30"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-xs tracking-widest uppercase transition-colors disabled:opacity-50 ${
                  variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-500'
                    : 'bg-amber-400 text-black hover:bg-amber-300'
                }`}
              >
                {loading ? 'Aguarde...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
