const Avatar = ({ src, alt, name, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12'
  }
  
  const getInitials = (name) => {
    if (!name) return ''
    return name.split(' ').map(n => n[0]).join('').substring(0, 2)
  }
  
  return (
    <div
      className={`${sizes[size]} rounded-full bg-cover bg-center border-2 border-white dark:border-slate-700 shadow-sm ${className}`}
      style={src ? { backgroundImage: `url(${src})` } : {}}
      data-alt={alt || name}
    >
      {!src && (
        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {getInitials(name)}
        </div>
      )}
    </div>
  )
}

export default Avatar

