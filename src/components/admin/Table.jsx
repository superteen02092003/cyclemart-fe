import { cn } from '@/utils/cn'

export function Table({ columns, data, actions, className }) {
  return (
    <div className={cn('overflow-x-auto border border-border-light rounded-sm shadow-card', className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-surface-tertiary border-b border-border-light">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-sm font-semibold text-content-primary"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-4 text-left text-sm font-semibold text-content-primary">Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-content-secondary">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b border-border-light hover:bg-surface-secondary transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-content-primary">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

