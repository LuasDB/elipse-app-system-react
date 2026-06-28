import { useRef, useState } from 'react'
import { Upload, File, X, ExternalLink, Trash2 } from 'lucide-react'

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

const fileIconColor = (mimetype) => {
  if (mimetype?.includes('pdf')) return { bg: '#DC26261A', color: '#DC2626' }
  if (mimetype?.includes('image')) return { bg: '#2563EB1A', color: '#2563EB' }
  if (mimetype?.includes('word')) return { bg: '#1E40AF1A', color: '#1E40AF' }
  if (mimetype?.includes('sheet') || mimetype?.includes('excel')) return { bg: '#0596691A', color: '#059669' }
  return { bg: 'var(--color-surface)', color: 'var(--color-text-muted)' }
}

/**
 * Zona de subida de archivos con drag&drop + lista de archivos existentes.
 *
 * Props:
 * - existingFiles: array de archivos ya guardados en el servidor [{ fileName, originalName, size, mimetype, uploadedAt }]
 * - pendingFiles: array de File objects (los que aún no se han subido al servidor)
 * - onAddPending: callback(File[]) — se llaman cuando el usuario agrega nuevos archivos
 * - onRemovePending: callback(index) — quitar uno de los pending
 * - onRemoveExisting: callback(fileName) — eliminar uno ya guardado (puede ser null si no se permite eliminar)
 * - serverBase: URL base para preview (e.g. http://localhost:3000)
 * - contractId: para construir URL de preview de existingFiles
 * - maxSize: tamaño máximo en MB (default 20)
 * - accept: string MIME para el input (default: PDF, imágenes, Word, Excel)
 * - disabled: bool
 */
const FileUploadZone = ({
  existingFiles = [],
  pendingFiles = [],
  onAddPending,
  onRemovePending,
  onRemoveExisting,
  serverBase = '',
  contractId,
  maxSize = 20,
  accept = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx',
  disabled = false
}) => {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleFiles = (fileList) => {
    setError(null)
    const files = Array.from(fileList)
    const maxBytes = maxSize * 1024 * 1024
    const tooLarge = files.find(f => f.size > maxBytes)
    if (tooLarge) {
      setError(`"${tooLarge.name}" excede el límite de ${maxSize}MB`)
      return
    }
    onAddPending?.(files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  const handleChange = (e) => {
    if (e.target.files?.length) handleFiles(e.target.files)
    e.target.value = '' // reset para poder volver a seleccionar el mismo archivo
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative rounded-lg border-2 border-dashed px-4 py-6 text-center transition-all cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--color-surface)]'}`}
        style={{
          borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-border)',
          background: isDragging ? 'var(--color-accent-muted)' : 'transparent'
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <Upload size={20} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {isDragging ? 'Suelta los archivos aquí' : 'Click para seleccionar o arrastra archivos'}
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          PDF, imágenes, Word, Excel · máx {maxSize}MB por archivo
        </p>
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-md" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}

      {/* Lista combinada: existentes + pending */}
      {(existingFiles.length > 0 || pendingFiles.length > 0) && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            {existingFiles.length + pendingFiles.length} archivo(s)
          </p>

          {/* Archivos ya guardados */}
          {existingFiles.map((f, i) => {
            const iconClr = fileIconColor(f.mimetype)
            const url = serverBase && contractId
              ? `${serverBase}/uploads/contracts/${contractId}/${f.fileName}`
              : null
            return (
              <div key={`existing-${i}`} className="flex items-center gap-2 p-2 rounded-md bg-white border" style={{ borderColor: 'var(--color-border-light)' }}>
                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: iconClr.bg }}>
                  <File size={13} style={{ color: iconClr.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{f.originalName}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    {formatFileSize(f.size)}{f.uploadedAt ? ` · ${formatDate(f.uploadedAt)}` : ''}
                  </p>
                </div>
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0" title="Abrir">
                    <ExternalLink size={12} style={{ color: 'var(--color-info)' }} />
                  </a>
                )}
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemoveExisting(f.fileName) }}
                    className="p-1.5 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Eliminar"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                )}
              </div>
            )
          })}

          {/* Archivos pendientes de subir */}
          {pendingFiles.map((f, i) => {
            const iconClr = fileIconColor(f.type)
            return (
              <div key={`pending-${i}`} className="flex items-center gap-2 p-2 rounded-md border-2 border-dashed" style={{ borderColor: 'var(--color-accent)', background: 'var(--color-accent-muted)' }}>
                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: iconClr.bg }}>
                  <File size={13} style={{ color: iconClr.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{f.name}</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'var(--color-accent)', color: 'white' }}>
                      Pendiente
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{formatFileSize(f.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePending?.(i)}
                  className="p-1.5 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                  title="Quitar"
                >
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileUploadZone