import React from 'react'

export function Icon({ name, alt = '', className = '' }) {
  return <img className={`ui-icon ${className}`} src={`./icons/${name}`} alt={alt} />
}

export function Th({ children, className = '' }) {
  return <span className={`th ${className}`}>{children}</span>
}

export function PageTitle({ title, th, right }) {
  return (
    <div className="section-title">
      <div><h2>{title}</h2><p>{th}</p></div>
      {right}
    </div>
  )
}

export function Pill({ tone = 'info', children }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>
}

export function Modal({ open, onClose, children, width = 720 }) {
  if (!open) return null
  return (
    <div className="modal show" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  )
}
