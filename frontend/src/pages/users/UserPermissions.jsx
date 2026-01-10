import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Avatar from '../../components/ui/Avatar'
import { USER_ROLES, USER_ROLE_LABELS } from '../../utils/constants'
import { userService } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'

const UserPermissions = () => {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [role, setRole] = useState(USER_ROLES.ADMIN)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: USER_ROLES.USER
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Redirect non-admin users to dashboard (defense in depth)
  useEffect(() => {
    // Only redirect if user is loaded and is not admin
    if (currentUser !== null && currentUser !== undefined && currentUser.role !== USER_ROLES.ADMIN) {
      navigate('/dashboard', { replace: true })
    }
  }, [currentUser, navigate])

  useEffect(() => {
    // Only fetch users if current user is admin
    if (currentUser?.role === USER_ROLES.ADMIN) {
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])


  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getUsers()
      if (response.data.success) {
        setUsers(response.data.data || [])
        if (response.data.data && response.data.data.length > 0) {
          setSelectedUserId(response.data.data[0].id)
          setSelectedUser(response.data.data[0])
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('فشل في تحميل المستخدمين')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }


  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setSelectedUserId(user.id)
    // Map old roles (lawyer, trainee, clerk) to 'user' for the role template dropdown
    const normalizedRole = (user.role === 'lawyer' || user.role === 'trainee' || user.role === 'clerk') 
      ? USER_ROLES.USER 
      : user.role
    setRole(normalizedRole || USER_ROLES.USER)
  }

  const handleRoleChange = async (e) => {
    const newRole = e.target.value
    if (!selectedUserId || !newRole) return
    
    // Update local state immediately for better UX
    setRole(newRole)
    
    try {
      setSaving(true)
      await userService.updateUser(selectedUserId, { role: newRole })
      
      // Update the selected user's role in the users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUserId ? { ...user, role: newRole } : user
        )
      )
      
      // Update selected user
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, role: newRole })
      }
      
      alert('تم تحديث الدور بنجاح')
    } catch (err) {
      console.error('Error updating role:', err)
      // Revert role on error
      const normalizedRole = (selectedUser?.role === 'lawyer' || selectedUser?.role === 'trainee' || selectedUser?.role === 'clerk') 
        ? USER_ROLES.USER 
        : selectedUser?.role
      setRole(normalizedRole || USER_ROLES.USER)
      alert(err.response?.data?.message || 'فشل في تحديث الدور. يرجى المحاولة مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'الإعدادات', path: '/settings' },
    { label: 'إدارة الصلاحيات' }
  ]

  // Helper function to get role label, mapping old roles (lawyer, trainee, clerk) to 'user'
  const getRoleLabel = (role) => {
    if (!role) return ''
    // Map old roles to user
    if (role === 'lawyer' || role === 'trainee' || role === 'clerk') {
      return USER_ROLE_LABELS[USER_ROLES.USER] || 'مستخدم'
    }
    return USER_ROLE_LABELS[role] || role
  }


  const handleDeleteUser = async (userId, userName, e) => {
    e.stopPropagation() // Prevent row click
    
    // Prevent deleting yourself
    if (currentUser?.id === userId) {
      alert('لا يمكنك حذف حسابك الخاص. يرجى استخدام مستخدم إداري آخر لحذف هذا الحساب.')
      return
    }
    
    // Confirm deletion
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`)) {
      return
    }

    try {
      setDeletingUserId(userId)
      await userService.deleteUser(userId)
      
      // If we deleted the selected user, clear selection
      if (selectedUserId === userId) {
        setSelectedUser(null)
        setSelectedUserId(null)
      }
      
      // Refresh users list
      await fetchUsers()
      alert('تم حذف المستخدم بنجاح')
    } catch (err) {
      console.error('Error deleting user:', err)
      alert(err.response?.data?.message || 'فشل في حذف المستخدم. يرجى المحاولة مرة أخرى.')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateLoading(true)

    try {
      // Ensure role is always set to a valid value
      const userData = {
        ...newUser,
        role: newUser.role || USER_ROLES.USER
      }
      
      const response = await userService.createUser(userData)
      if (response.data.success) {
        setShowCreateModal(false)
        setNewUser({ name: '', email: '', password: '', role: USER_ROLES.USER })
        setCreateError('')
        fetchUsers() // Refresh the users list
        alert('تم إنشاء المستخدم بنجاح')
      }
    } catch (err) {
      console.error('Error creating user:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.role?.[0] ||
                          err.response?.data?.errors?.email?.[0] || 
                          'فشل في إنشاء المستخدم. يرجى المحاولة مرة أخرى.'
      setCreateError(errorMessage)
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={breadcrumbs}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-4">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
            إدارة صلاحيات المستخدمين
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            تحكم في مستويات الوصول للموظفين والمحامين وتعيين الأدوار في النظام.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="file_download">تصدير القائمة</Button>
          {currentUser?.role === USER_ROLES.ADMIN && (
            <Button 
              variant="primary" 
              icon="person_add"
              onClick={() => setShowCreateModal(true)}
            >
              إضافة مستخدم
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 mb-2">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full pr-10 pl-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400"
              placeholder="بحث عن مستخدم بالاسم، الهوية، أو البريد الإلكتروني..."
            />
          </div>
          <Select
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'جميع الأدوار' },
              ...Object.entries(USER_ROLES).map(([key, value]) => ({
                value,
                label: USER_ROLE_LABELS[value]
              }))
            ]}
            className="w-full md:w-48"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Users List */}
        <div className="xl:col-span-7">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">المستخدم</th>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">الدور الوظيفي</th>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">الحالة</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">جاري تحميل المستخدمين...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center">
                        <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
                        <Button variant="primary" size="sm" onClick={fetchUsers}>إعادة المحاولة</Button>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center">
                        <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">person</span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">لا يوجد مستخدمين</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className={`group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          selectedUserId === user.id ? 'bg-primary/5 dark:bg-primary/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} size="md" />
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">نشط</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {currentUser?.role === USER_ROLES.ADMIN && (
                              <>
                                <button
                                  className="text-primary hover:text-blue-700 p-2 rounded-full hover:bg-primary/10 transition-colors"
                                  title="تعديل"
                                >
                                  <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteUser(user.id, user.name, e)}
                                  disabled={deletingUserId === user.id || currentUser?.id === user.id}
                                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={currentUser?.id === user.id ? 'لا يمكنك حذف حسابك الخاص' : 'حذف'}
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    {deletingUserId === user.id ? 'hourglass_empty' : 'delete'}
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Permissions Editor */}
        <div className="xl:col-span-5">
          <Card className="sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">تعديل الدور</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  تغيير دور المستخدم: <span className="font-semibold text-primary">{selectedUser?.name || 'اختر مستخدم'}</span>
                </p>
              </div>
            </div>

            <div className="p-6 pb-2 shrink-0">
              <Select
                label="الدور الوظيفي"
                value={role}
                onChange={handleRoleChange}
                disabled={!selectedUserId || saving}
                options={Object.entries(USER_ROLES).map(([key, value]) => ({
                  value,
                  label: USER_ROLE_LABELS[value]
                }))}
              />
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">info</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                      الصلاحيات محددة تلقائياً حسب الدور
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>مدير النظام:</strong> جميع الصلاحيات</li>
                      <li><strong>مستخدم:</strong> جميع صلاحيات القضايا (بدون إدارة المستخدمين)</li>
                      <li><strong>عارض:</strong> عرض فقط (لا يمكن التعديل أو الحذف)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl flex justify-end gap-3 shrink-0">
              {!selectedUserId && (
                <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">
                  اختر مستخدماً لتعديل دوره
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!createLoading) {
              setShowCreateModal(false)
              setNewUser({ name: '', email: '', password: '', role: USER_ROLES.USER })
              setCreateError('')
            }
          }}
        >
          <Card 
            className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  إضافة مستخدم جديد
                </h2>
                <button
                  onClick={() => {
                    if (!createLoading) {
                      setShowCreateModal(false)
                      setNewUser({ name: '', email: '', password: '', role: USER_ROLES.USER })
                      setCreateError('')
                    }
                  }}
                  disabled={createLoading}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {createError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    الاسم الكامل
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل الاسم الكامل"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                    disabled={createLoading}
                    className="w-full pr-4 pl-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    البريد الإلكتروني
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@lawfirm.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    disabled={createLoading}
                    className="w-full pr-4 pl-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    كلمة المرور
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="كلمة مرور قوية (8 أحرف على الأقل)"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={8}
                    disabled={createLoading}
                    className="w-full pr-4 pl-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    الدور
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <Select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    disabled={createLoading}
                    options={[
                      { value: USER_ROLES.ADMIN, label: USER_ROLE_LABELS[USER_ROLES.ADMIN] },
                      { value: USER_ROLES.USER, label: USER_ROLE_LABELS[USER_ROLES.USER] },
                      { value: USER_ROLES.VIEWER, label: USER_ROLE_LABELS[USER_ROLES.VIEWER] }
                    ]}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewUser({ name: '', email: '', password: '', role: USER_ROLES.USER })
                      setCreateError('')
                    }}
                    disabled={createLoading}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={createLoading || !newUser.name || !newUser.email || !newUser.password || newUser.password.length < 8}
                    className="flex-1"
                  >
                    {createLoading ? 'جاري الإنشاء...' : 'إنشاء مستخدم'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}

export default UserPermissions

