import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Filter, MoreHorizontal,
  Pencil, Trash2, Users as UsersIcon,
  UserCheck, UserX, ChevronDown
} from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import RoleBadge from '@/components/common/RoleBadge'
import UserFormModal from './UserFormModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Toast from '@/components/common/Toast'
import usersService from '@/services/usersService'
import { ROLES } from '@/utils/roles'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modal states
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await usersService.getAll()
      setUsers(response.data || [])
    } catch (error) {
      setToast({ message: 'Error al cargar usuarios', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Filter logic
  useEffect(() => {
    let result = [...users]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      )
    }
    if (roleFilter) result = result.filter(u => u.role === roleFilter)
    if (statusFilter === 'active') result = result.filter(u => u.active !== false)
    if (statusFilter === 'inactive') result = result.filter(u => u.active === false)
    setFilteredUsers(result)
  }, [users, search, roleFilter, statusFilter])

  // Create / Update
  const handleSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingUser) {
        await usersService.update(editingUser._id, formData)
        setToast({ message: 'Usuario actualizado correctamente', type: 'success' })
      } else {
        await usersService.create(formData)
        setToast({ message: 'Usuario creado correctamente', type: 'success' })
      }
      setFormOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      setToast({ message: error.message || 'Error al guardar', type: 'error' })
    } finally {
      setFormLoading(false)
    }
  }

  // Delete
  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await usersService.delete(deletingUser._id)
      setToast({ message: 'Usuario eliminado', type: 'success' })
      setDeleteOpen(false)
      setDeletingUser(null)
      fetchUsers()
    } catch (error) {
      setToast({ message: error.message || 'Error al eliminar', type: 'error' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setFormOpen(true)
    setOpenMenuId(null)
  }

  const openDelete = (user) => {
    setDeletingUser(user)
    setDeleteOpen(true)
    setOpenMenuId(null)
  }

  // Stats
  const stats = [
    { label: 'Total', value: users.length, icon: UsersIcon, color: 'var(--color-primary)', bg: 'var(--color-info-bg)' },
    { label: 'Activos', value: users.filter(u => u.active !== false).length, icon: UserCheck, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    { label: 'Inactivos', value: users.filter(u => u.active === false).length, icon: UserX, color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
  ]

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Usuarios"
        subtitle="Administra los usuarios y roles del sistema"
        actions={
          <button
            onClick={() => { setEditingUser(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/20 active:scale-[0.98]"
            style={{ background: 'var(--color-primary)' }}
          >
            <Plus size={18} />
            Nuevo usuario
          </button>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border bg-white"
            style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl border bg-white mb-4"
        style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-8 pr-8 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 appearance-none cursor-pointer"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <option value="">Todos los roles</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 appearance-none cursor-pointer"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-sunken)' }}>
                {['Usuario', 'Correo', 'Teléfono', 'Rol', 'Estado', ''].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Cargando usuarios...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <UsersIcon size={40} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {search || roleFilter || statusFilter ? 'No se encontraron resultados' : 'Aún no hay usuarios registrados'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {search || roleFilter || statusFilter ? 'Prueba con otros filtros' : 'Crea el primer usuario con el botón de arriba'}
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.map((user, idx) => (
                <tr
                  key={user._id || idx}
                  className="group hover:bg-[var(--color-surface)] transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border-light)' }}
                >
                  {/* Name + avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))`,
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{user.email}</span>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-3.5">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{user.phone || '—'}</span>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3.5">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: user.active !== false ? 'var(--color-success)' : 'var(--color-danger)' }}
                      />
                      <span className="text-xs font-medium" style={{ color: user.active !== false ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {user.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === (user._id || idx) ? null : (user._id || idx))}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal size={16} style={{ color: 'var(--color-text-muted)' }} />
                      </button>

                      {openMenuId === (user._id || idx) && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div
                            className="absolute right-0 top-full mt-1 z-20 w-40 bg-white rounded-lg border shadow-lg py-1 animate-scaleIn origin-top-right"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            <button
                              onClick={() => openEdit(user)}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface)] transition-colors"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              <Pencil size={14} />
                              Editar
                            </button>
                            <button
                              onClick={() => openDelete(user)}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-red-50 transition-colors"
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={14} />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-sunken)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> usuarios
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingUser(null) }}
        onSubmit={handleSubmit}
        user={editingUser}
        loading={formLoading}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingUser(null) }}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar a ${deletingUser?.name}? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default UsersPage
