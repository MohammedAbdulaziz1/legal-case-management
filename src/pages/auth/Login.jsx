import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { validateLoginForm } from '../../utils/validation'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})

    const validation = validateLoginForm(email, password)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Right Side: Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-background-light dark:bg-background-dark z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header / Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
              <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              نظام القضايا
            </h2>
          </div>

          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              تسجيل الدخول
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              مرحباً بك مجدداً، يرجى إدخال بيانات حسابك للمتابعة إلى لوحة التحكم.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="name@lawfirm.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
              }}
              required
              icon="mail"
              error={errors.email}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                  كلمة المرور
                </label>
                <div className="text-sm">
                  <a className="font-semibold text-primary hover:text-blue-500" href="#">
                    نسيت كلمة المرور؟
                  </a>
                </div>
              </div>
              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                }}
                required
                icon="lock"
                error={errors.password}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            {/* Support Link */}
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              تواجه مشكلة في الدخول؟
              <a className="font-semibold text-primary hover:text-blue-500 mr-1" href="#">
                تواصل مع الدعم الفني
              </a>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              © 2024 وزارة العدل - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>

      {/* Left Side: Decorative Image (Visible on Desktop) */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-slate-900/10 dark:bg-slate-900/40 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 mix-blend-multiply z-20"></div>
        <img
          alt="Scales of justice in a modern law firm office setting"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH-LbH7IOcySYzfzQG3lN6NUIDvjxxhBdbnnIOzuHCzO2-ux-DuM5pf5kN4kFsz79hTfBQHJu-d_GAkXB7vf9rtVjRxXWbCCpjR4LPETEIzeYOVak4f6NTjyjR0f8bBjzICRuFNr9AVtmC2VrWXt1otCl5o_6wXSRk0wEUNRryYp-SAy7MlQeWC4P9KGXlVBCS5RiFOKm-9bhjkuRU3_oGEVtVKBayRVnNaxl9J2y5hGz1TvDvfHSb92B4Tm0xdNcS0xJGkmUtBlM"
        />
        <div className="absolute inset-0 z-30 flex flex-col justify-end p-20 pb-24 text-white">
          <div className="mb-6 size-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[32px]">gavel</span>
          </div>
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed opacity-90">
              "العدالة هي أساس الملك، ونحن هنا لضمان سير الإجراءات القانونية بأعلى معايير الكفاءة والشفافية."
            </p>
            <footer className="text-sm font-medium text-white/70">نظام إدارة المحاكم والقضايا</footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}

export default Login

