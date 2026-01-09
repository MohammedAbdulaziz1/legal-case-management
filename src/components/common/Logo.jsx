const Logo = ({ size = 'md', className = '', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  // If variant is 'primary', use the styled version from the HTML
  if (variant === 'primary') {
    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ${className}`}>
        <span className={`material-symbols-outlined ${iconSizes[size]}`}>gavel</span>
      </div>
    )
  }

  // Default variant - can be styled by parent
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <span className={`material-symbols-outlined ${iconSizes[size]} text-inherit`}>gavel</span>
    </div>
  )
}

export default Logo

