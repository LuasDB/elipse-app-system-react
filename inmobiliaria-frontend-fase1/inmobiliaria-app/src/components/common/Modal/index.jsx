import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, size = 'xl' }) => {
    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-5xl'
    }

    

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity bg-gray-800 bg-opacity-75 px-2">
        
        <div
            className={`
            flex flex-col w-full ${sizes[size]} 
            max-h-[95vh]
            bg-white rounded-lg shadow-xl
            `}
        >
            {/* HEADER (fijo) */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
            </button>
            </div>

            {/* BODY (scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 ">
            {children}
            </div>
        </div>
        </div>
    );
}

export default Modal