import { useState, useRef, useEffect } from 'react'

const SearchableSelect = ({
  label,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  required = false,
  className = '',
  placeholder = 'ابحث أو اختر...',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options])

  // Get selected option label
  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : ''

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } })
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          onClick={() => !disabled && !isOpen && setIsOpen(true)}
          className={`w-full appearance-none rounded-lg border py-2.5 pr-4 pl-10 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow cursor-pointer ${
            disabled ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400' : ''
          } ${error ? 'border-red-500' : ''} ${isOpen ? 'ring-2 ring-primary/50 border-primary' : ''}`}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onClick={(e) => e.stopPropagation()}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400"
              disabled={disabled}
            />
          ) : (
            <span className="block truncate">
              {displayValue || placeholder}
            </span>
          )}
        </div>
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
          {isOpen ? 'search' : 'expand_more'}
        </span>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                لا توجد نتائج
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    value === option.value
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default SearchableSelect
