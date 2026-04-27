import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Search, Pencil, Trash2, MoreHorizontal,
  Home, Car, Warehouse, Ruler, BedDouble, Bath, ChevronDown, DollarSign, Filter
} from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Toast from '@/components/common/Toast'
import UnitFormModal from './UnitFormModal'
import projectsService from '@/services/projectsService'
import unitsService from '@/services/unitsService'
import { PROJECT_STATUS, UNIT_STATUS, UNIT_TYPES, getStatusConfig } from '@/utils/projectConstants'

import { formatUSD } from '@/utils/currency'

const formatPrice = (n) => formatUSD(n)

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Modals
  const [formOpen, setFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingUnit, setDeletingUnit] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [projRes, unitsRes] = await Promise.all([
        projectsService.getById(id),
        unitsService.getByProject(id)
      ])
      setProject(projRes.data)
      setUnits(unitsRes.data || [])
    } catch (error) {
      setToast({ message: 'Error al cargar el proyecto', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  // Filter
  const filteredUnits = units.filter(u => {
    if (statusFilter && u.status !== statusFilter) return false
    if (typeFilter && u.unitType !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return u.identifier?.toLowerCase().includes(q) || u.notes?.toLowerCase().includes(q)
    }
    return true
  })

  // CRUD handlers
  const handleSubmitUnit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingUnit) {
        await unitsService.update(editingUnit._id, formData)
        setToast({ message: 'Unidad actualizada', type: 'success' })
      } else {
        await unitsService.create({ ...formData, projectId: id })
        setToast({ message: 'Unidad creada', type: 'success' })
      }
      setFormOpen(false)
      setEditingUnit(null)
      fetchData()
    } catch (error) {
      setToast({ message: error.message || 'Error al guardar', type: 'error' })
    } finally { setFormLoading(false) }
  }

  const handleDeleteUnit = async () => {
    setDeleteLoading(true)
    try {
      await unitsService.delete(deletingUnit._id)
      setToast({ message: 'Unidad eliminada', type: 'success' })
      setDeleteOpen(false)
      setDeletingUnit(null)
      fetchData()
    } catch (error) {
      setToast({ message: error.message || 'Error al eliminar', type: 'error' })
    } finally { setDeleteLoading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
    </div>
  )

  if (!project) return null

  const pStatus = getStatusConfig(PROJECT_STATUS, project.status)
  const stats = project.unitStats || {}

  return (
    <div className="animate-fadeIn">
      {/* Back + Header */}
      <button onClick={() => navigate('/proyectos')} className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors hover:text-[var(--color-accent)]" style={{ color: 'var(--color-text-secondary)' }}>
        <ArrowLeft size={16} /> Volver a proyectos
      </button>

      {/* Project header card */}
      <div className="rounded-xl border bg-white p-6 mb-6" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{project.name}</h1>
              <StatusBadge label={pStatus.label} color={pStatus.color} bg={pStatus.bg} />
            </div>
            {(project.street || project.colony || project.city) && (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {[project.street, project.colony, project.city, project.state].filter(Boolean).join(', ')}
              </p>
            )}
            {project.description && <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{project.description}</p>}
          </div>
          <button
            onClick={() => { setEditingUnit(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/20 active:scale-[0.98] flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            <Plus size={18} /> Nueva unidad
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-[var(--color-border-light)]">
          {[
            { label: 'Registradas', value: stats.total || 0, color: 'var(--color-primary)' },
            { label: 'Disponibles', value: stats.disponible || 0, color: 'var(--color-success)' },
            { label: 'Apartadas', value: stats.apartada || 0, color: 'var(--color-warning)' },
            { label: 'Vendidas', value: stats.vendida || 0, color: '#2563EB' },
            { label: 'Entregadas', value: stats.entregada || 0, color: 'var(--color-primary)' },
            { label: 'Planeadas', value: project.totalUnits || '—', color: 'var(--color-text-muted)' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl border bg-white mb-4" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar unidad..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-3 pr-8 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none appearance-none cursor-pointer" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            <option value="">Todos los estados</option>
            {UNIT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]" />
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="pl-3 pr-8 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none appearance-none cursor-pointer" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            <option value="">Todos los tipos</option>
            {UNIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]" />
        </div>
      </div>

      {/* Units table */}
      <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-sunken)' }}>
                {['Unidad', 'Tipo', 'm²', 'Rec.', 'Baños', 'Est.', 'Bodega', 'Precio Lista (USD)', 'Estado', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <Home size={36} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {units.length === 0 ? 'Aún no hay unidades registradas' : 'No se encontraron resultados'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {units.length === 0 ? 'Agrega la primera unidad al proyecto' : 'Prueba con otros filtros'}
                    </p>
                  </td>
                </tr>
              ) : filteredUnits.map((unit, idx) => {
                const uStatus = getStatusConfig(UNIT_STATUS, unit.status)
                const uType = UNIT_TYPES.find(t => t.value === unit.unitType)
                return (
                  <tr key={unit._id || idx} className="group hover:bg-[var(--color-surface)] transition-colors" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{unit.identifier}</span>
                      {unit.floor > 0 && <span className="text-xs ml-1.5" style={{ color: 'var(--color-text-muted)' }}>Piso {unit.floor}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{uType?.label || unit.unitType}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{unit.totalArea || '—'}</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>{unit.bedrooms || '—'}</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>{unit.bathrooms || '—'}</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>{unit.parkingSpaces || '—'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{unit.hasStorage ? (unit.storageNumber || 'Sí') : '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text)' }}>{formatPrice(unit.listPrice)}</td>
                    <td className="px-4 py-3"><StatusBadge label={uStatus.label} color={uStatus.color} bg={uStatus.bg} size="xs" /></td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === (unit._id || idx) ? null : (unit._id || idx))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={16} style={{ color: 'var(--color-text-muted)' }} />
                        </button>
                        {openMenuId === (unit._id || idx) && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white rounded-lg border shadow-lg py-1 animate-scaleIn origin-top-right" style={{ borderColor: 'var(--color-border)' }}>
                              <button onClick={() => { setEditingUnit(unit); setFormOpen(true); setOpenMenuId(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface)] transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                                <Pencil size={14} /> Editar
                              </button>
                              <button onClick={() => { setDeletingUnit(unit); setDeleteOpen(true); setOpenMenuId(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-red-50 transition-colors" style={{ color: 'var(--color-danger)' }}>
                                <Trash2 size={14} /> Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredUnits.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-sunken)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Mostrando <strong>{filteredUnits.length}</strong> de <strong>{units.length}</strong> unidades</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <UnitFormModal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditingUnit(null) }} onSubmit={handleSubmitUnit} unit={editingUnit} loading={formLoading} />
      <ConfirmDialog isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setDeletingUnit(null) }} onConfirm={handleDeleteUnit} title="Eliminar unidad" message={`¿Eliminar la unidad ${deletingUnit?.identifier}? Esta acción no se puede deshacer.`} loading={deleteLoading} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ProjectDetail
