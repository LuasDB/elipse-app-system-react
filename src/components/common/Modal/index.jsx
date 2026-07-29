import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, size = 'xl' }) => {
    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-5xl'
    }

    // Portal a document.body: algunas páginas envuelven su contenido en un
    // contenedor con transform (p.ej. la animación "animate-fadeIn"), lo cual
    // crea un containing block para position:fixed y rompe el overlay
    // (queda anclado al alto del contenido en vez de al viewport).
    return createPortal(
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center px-2"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`
                    flex flex-col w-full ${sizes[size]}
                    bg-white shadow-xl
                    rounded-t-2xl sm:rounded-lg
                    h-[100dvh] sm:h-auto sm:max-h-[90vh]
                `}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* BODY (scroll) */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}

export default Modal
