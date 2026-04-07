import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Building2, MapPin, Home,
  Pencil, Trash2, MoreHorizontal, ChevronDown, Eye
} from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import ProjectFormModal from './ProjectFormModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Toast from '@/components/common/Toast'
import projectsService from '@/services/projectsService'
import { PROJECT_STATUS, PROJECT_TYPES, getStatusConfig } from '@/utils/projectConstants'

const ProjectsPage = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProject, setDeletingProject] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await projectsService.getAll()
      setProjects(response.data || [])
    } catch (error) {
      setToast({ message: 'Error al cargar proyectos', type: 'error' })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filtered = projects.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || p.colony?.toLowerCase().includes(q)
    }
    return true
  })

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingProject) {
        await projectsService.update(editingProject._id, formData)
        setToast({ message: 'Proyecto actualizado', type: 'success' })
      } else {
        await projectsService.create(formData)
        setToast({ message: 'Proyecto creado', type: 'success' })
      }
      setFormOpen(false)
      setEditingProject(null)
      fetchProjects()
    } catch (error) {
      setToast({ message: error.message || 'Error al guardar', type: 'error' })
    } finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await projectsService.delete(deletingProject._id)
      setToast({ message: 'Proyecto eliminado', type: 'success' })
      setDeleteOpen(false)
      setDeletingProject(null)
      fetchProjects()
    } catch (error) {
      setToast({ message: error.message || 'Error al eliminar', type: 'error' })
    } finally { setDeleteLoading(false) }
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Proyectos"
        subtitle="Desarrollos inmobiliarios activos"
        actions={
          <button
            onClick={() => { setEditingProject(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/20 active:scale-[0.98]"
            style={{ background: 'var(--color-primary)' }}
          >
            <Plus size={18} /> Nuevo proyecto
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar proyecto..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-3 pr-8 py-2.5 text-sm rounded-lg border bg-white focus:outline-none appearance-none cursor-pointer" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            <option value="">Todos los estados</option>
            {PROJECT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]" />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed" style={{ borderColor: 'var(--color-border)' }}>
          <Building2 size={48} style={{ color: 'var(--color-border)' }} />
          <p className="text-sm font-medium mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            {projects.length === 0 ? 'Aún no hay proyectos registrados' : 'No se encontraron resultados'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {projects.length === 0 ? 'Crea tu primer desarrollo inmobiliario' : 'Prueba con otros filtros'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project, idx) => {
            const pStatus = getStatusConfig(PROJECT_STATUS, project.status)
            const pType = PROJECT_TYPES.find(t => t.value === project.type)
            const stats = project.unitStats || {}
            const totalRegistered = stats.total || 0
            const soldPercent = totalRegistered > 0 ? Math.round(((stats.vendida || 0) + (stats.entregada || 0)) / totalRegistered * 100) : 0

            return (
              <div
                key={project._id || idx}
                className="group rounded-xl border bg-white overflow-hidden transition-all hover:shadow-md cursor-pointer"
                style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
                onClick={() => navigate(`/proyectos/${project._id}`)}
              >
                {/* Card header */}
                <div className="p-5 pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{project.name}</h3>
                      {(project.city || project.colony) && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
                          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                            {[project.colony, project.city].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Menu */}
                    <div className="relative flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === (project._id || idx) ? null : (project._id || idx))}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal size={16} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                      {openMenuId === (project._id || idx) && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white rounded-lg border shadow-lg py-1 animate-scaleIn origin-top-right" style={{ borderColor: 'var(--color-border)' }}>
                            <button onClick={() => navigate(`/proyectos/${project._id}`)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface)] transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                              <Eye size={14} /> Ver detalle
                            </button>
                            <button onClick={() => { setEditingProject(project); setFormOpen(true); setOpenMenuId(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface)] transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                              <Pencil size={14} /> Editar
                            </button>
                            <button onClick={() => { setDeletingProject(project); setDeleteOpen(true); setOpenMenuId(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-red-50 transition-colors" style={{ color: 'var(--color-danger)' }}>
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge label={pStatus.label} color={pStatus.color} bg={pStatus.bg} size="xs" />
                    {pType && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100" style={{ color: 'var(--color-text-muted)' }}>{pType.label}</span>}
                  </div>
                </div>

                {/* Stats */}
                <div className="px-5 py-4">
                  {/* Progress bar */}
                  <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
                    <span style={{ color: 'var(--color-text-muted)' }}>Avance de ventas</span>
                    <span style={{ color: 'var(--color-accent)' }}>{soldPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${soldPercent}%`, background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-light))' }} />
                  </div>

                  {/* Unit counts */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                      { label: 'Disponibles', value: stats.disponible || 0, color: 'var(--color-success)' },
                      { label: 'Apartadas', value: stats.apartada || 0, color: 'var(--color-warning)' },
                      { label: 'Vendidas', value: stats.vendida || 0, color: '#2563EB' },
                      { label: 'Entregadas', value: stats.entregada || 0, color: 'var(--color-primary)' },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-sunken)' }}>
                  <div className="flex items-center gap-1.5">
                    <Home size={13} style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {totalRegistered} / {project.totalUnits || '—'} unidades
                    </span>
                  </div>
                  <span className="text-xs font-medium group-hover:text-[var(--color-accent)] transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                    Ver detalle →
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <ProjectFormModal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditingProject(null) }} onSubmit={handleSubmit} project={editingProject} loading={formLoading} />
      <ConfirmDialog isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setDeletingProject(null) }} onConfirm={handleDelete} title="Eliminar proyecto" message={`¿Eliminar "${deletingProject?.name}"? Solo se puede eliminar si no tiene unidades asociadas.`} loading={deleteLoading} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ProjectsPage
