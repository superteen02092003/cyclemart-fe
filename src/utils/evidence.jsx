const URL_PATTERN = /^https?:\/\/[^\s]+$/i

export const isValidEvidenceUrl = (value) => {
  if (!value || typeof value !== 'string') return false
  return URL_PATTERN.test(value.trim())
}

export function EvidenceValue({ value, className = '' }) {
  if (!value) return null

  const text = String(value).trim()
  if (!isValidEvidenceUrl(text)) {
    return <p className={`break-all text-sm text-content-primary ${className}`}>{text}</p>
  }

  return (
    <a
      href={text}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-sm text-navy underline hover:text-orange ${className}`}
    >
      <span className="material-symbols-outlined text-[1rem]">open_in_new</span>
      Xem bằng chứng
    </a>
  )
}
