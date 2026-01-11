import { useMemo, useState } from 'react'
import DatePicker from 'react-multi-date-picker'
import 'react-multi-date-picker/styles/colors/teal.css'
import DateObject from 'react-date-object'
import gregorian from 'react-date-object/calendars/gregorian'
import arabic from 'react-date-object/calendars/arabic'
import gregorian_ar from 'react-date-object/locales/gregorian_ar'
import arabic_ar from 'react-date-object/locales/arabic_ar'
import Input from './Input'

const isIsoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

const DualDateInput = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const initialMode = 'gregorian'
  const [mode, setMode] = useState(initialMode) // 'gregorian' | 'hijri'

  const pickerConfig = useMemo(() => {
    if (mode === 'hijri') {
      return {
        calendar: arabic,
        locale: arabic_ar
      }
    }

    return {
      calendar: gregorian,
      locale: gregorian_ar
    }
  }, [mode])

  const pickerValue = useMemo(() => {
    if (!isIsoDate(value)) return null
    const [y, m, d] = value.split('-').map((x) => parseInt(x, 10))
    // Always construct in Gregorian then convert depending on mode
    const base = new DateObject({ year: y, month: m, day: d, calendar: gregorian, locale: gregorian_ar })
    return mode === 'hijri' ? base.convert(arabic, arabic_ar) : base
  }, [value, mode])

  const handlePickerChange = (dateObj) => {
    if (!dateObj) {
      onChange?.('')
      return
    }

    try {
      const iso = dateObj.convert(gregorian, gregorian_ar).format('YYYY-MM-DD')
      onChange?.(iso)
    } catch {
      // ignore
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 mb-2">
        {label ? (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setMode('gregorian')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors ${
              mode === 'gregorian'
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            ميلادي
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setMode('hijri')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors ${
              mode === 'hijri'
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            هجري
          </button>
        </div>
      </div>

      {mode === 'gregorian' ? (
        <DatePicker
          value={pickerValue}
          onChange={handlePickerChange}
          calendar={pickerConfig.calendar}
          locale={pickerConfig.locale}
          disabled={disabled}
          format="YYYY-MM-DD"
          render={(val, openCalendar) => (
            <Input
              label={null}
              value={val}
              onChange={() => {}}
              onClick={openCalendar}
              readOnly
              disabled={disabled}
              required={required}
              error={error}
              placeholder="YYYY-MM-DD"
            />
          )}
        />
      ) : (
        <DatePicker
          value={pickerValue}
          onChange={handlePickerChange}
          calendar={pickerConfig.calendar}
          locale={pickerConfig.locale}
          disabled={disabled}
          format="YYYY-MM-DD"
          render={(val, openCalendar) => (
            <Input
              label={null}
              value={val}
              onChange={() => {}}
              onClick={openCalendar}
              readOnly
              disabled={disabled}
              required={required}
              error={error}
              placeholder="YYYY-MM-DD"
            />
          )}
        />
      )}
    </div>
  )
}

export default DualDateInput
