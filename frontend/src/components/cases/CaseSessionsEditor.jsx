import { useEffect, useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import DualDateInput from '../common/DualDateInput'
import { sessionService } from '../../services/sessionService'
import { formatDateHijri } from '../../utils/hijriDate'

const CaseSessionsEditor = ({ caseType, caseNumber, enabled = true, canEdit = true }) => {
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState(null)
  const [sessions, setSessions] = useState([])

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [sessionForm, setSessionForm] = useState({ sessionDate: '', notes: '' })
  const [sessionFormErrors, setSessionFormErrors] = useState({})

  const fetchSessions = async () => {
    if (!enabled || !caseType || !caseNumber) return

    try {
      setSessionsLoading(true)
      setSessionsError(null)

      const resp = await sessionService.getSessions({
        case_type: caseType,
        case_number: caseNumber,
        per_page: 100,
      })

      if (resp.data?.success) {
        setSessions(resp.data.data || [])
      } else {
        setSessionsError('فشل في تحميل الجلسات')
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setSessionsError('فشل في تحميل الجلسات')
    } finally {
      setSessionsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [enabled, caseType, caseNumber])

  const openAddSessionModal = () => {
    setEditingSession(null)
    setSessionForm({ sessionDate: '', notes: '' })
    setSessionFormErrors({})
    setIsSessionModalOpen(true)
  }

  const openEditSessionModal = (s) => {
    setEditingSession(s)
    setSessionForm({
      sessionDate: s?.sessionDate || '',
      notes: s?.notes || '',
    })
    setSessionFormErrors({})
    setIsSessionModalOpen(true)
  }

  const closeSessionModal = () => {
    setIsSessionModalOpen(false)
    setEditingSession(null)
    setSessionForm({ sessionDate: '', notes: '' })
    setSessionFormErrors({})
  }

  const handleSaveSession = async () => {
    const nextErrors = {}
    if (!sessionForm.sessionDate) nextErrors.sessionDate = 'تاريخ الجلسة مطلوب'
    if (Object.keys(nextErrors).length > 0) {
      setSessionFormErrors(nextErrors)
      return
    }

    try {
      if (editingSession?.id) {
        await sessionService.updateSession(editingSession.id, {
          sessionDate: sessionForm.sessionDate,
          notes: sessionForm.notes,
        })
      } else {
        await sessionService.createSession({
          caseType,
          caseNumber,
          sessionDate: sessionForm.sessionDate,
          notes: sessionForm.notes,
        })
      }

      closeSessionModal()
      await fetchSessions()
    } catch (err) {
      console.error('Error saving session:', err)
      const msg = err.response?.data?.message || 'فشل في حفظ الجلسة'
      alert(msg)
    }
  }

  const handleDeleteSession = async (s) => {
    if (!s?.id) return
    const ok = window.confirm('هل أنت متأكد من حذف هذه الجلسة؟')
    if (!ok) return

    try {
      await sessionService.deleteSession(s.id)
      await fetchSessions()
    } catch (err) {
      console.error('Error deleting session:', err)
      const msg = err.response?.data?.message || 'فشل في حذف الجلسة'
      alert(msg)
    }
  }

  if (!enabled) return null

  return (
    <>
      <Card
        title="الجلسات"
        icon="event"
        headerActions={
          canEdit ? (
            <Button variant="primary" icon="add" onClick={openAddSessionModal}>
              إضافة جلسة
            </Button>
          ) : null
        }
      >
        {sessionsLoading ? (
          <div className="p-4 text-sm text-slate-500 dark:text-slate-400">جاري تحميل الجلسات...</div>
        ) : sessionsError ? (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">{sessionsError}</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-sm text-slate-500 dark:text-slate-400">لا توجد جلسات مسجلة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">تاريخ الجلسة</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">ملاحظات</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sessions.map((s) => (
                  <tr key={s.id || s.sessionDate}>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100">
                      {formatDateHijri(s.sessionDate) || 'غير محدد'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.notes || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditSessionModal(s)}
                          disabled={!canEdit}
                          className={`p-2 rounded-lg transition-colors ${
                            canEdit
                              ? 'text-slate-400 hover:text-primary hover:bg-primary/5'
                              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60'
                          }`}
                          title="تعديل"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(s)}
                          disabled={!canEdit}
                          className={`p-2 rounded-lg transition-colors ${
                            canEdit
                              ? 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60'
                          }`}
                          title="حذف"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={closeSessionModal}>
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingSession ? 'تعديل جلسة' : 'إضافة جلسة'}</h3>
              <button
                type="button"
                onClick={closeSessionModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <DualDateInput
                label="تاريخ الجلسة"
                value={sessionForm.sessionDate}
                onChange={(val) => {
                  setSessionForm((p) => ({ ...p, sessionDate: val }))
                  if (sessionFormErrors.sessionDate) {
                    setSessionFormErrors((prev) => {
                      const n = { ...prev }
                      delete n.sessionDate
                      return n
                    })
                  }
                }}
              />
              {sessionFormErrors.sessionDate && (
                <p className="text-xs text-red-600 dark:text-red-400 -mt-2">{sessionFormErrors.sessionDate}</p>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">ملاحظات</label>
                <textarea
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="أدخل ملاحظات الجلسة (اختياري)"
                  rows={4}
                  className="w-full rounded-lg border py-2.5 pr-4 pl-4 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={closeSessionModal}>
                  إلغاء
                </Button>
                <Button variant="primary" onClick={handleSaveSession}>
                  حفظ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CaseSessionsEditor
