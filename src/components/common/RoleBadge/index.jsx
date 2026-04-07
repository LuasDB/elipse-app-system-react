import { getRoleConfig } from '@/utils/roles'

const RoleBadge = ({ role, size = 'sm' }) => {
  const config = getRoleConfig(role)
  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizes[size]}`}
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  )
}

export default RoleBadge
