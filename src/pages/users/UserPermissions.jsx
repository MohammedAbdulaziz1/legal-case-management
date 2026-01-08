import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Avatar from '../../components/ui/Avatar'
import { USER_ROLES, USER_ROLE_LABELS } from '../../utils/constants'
import { userService } from '../../services/userService'

const UserPermissions = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [role, setRole] = useState(USER_ROLES.ADMIN)
  const [permissions, setPermissions] = useState({
    primaryCases: {
      enabled: false,
      view: false,
      add: false,
      edit: false,
      delete: false
    },
    appealCases: {
      enabled: false
    },
    userManagement: {
      enabled: false,
      view: false,
      edit: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      fetchUserPermissions(selectedUserId)
    }
  }, [selectedUserId])

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

  const fetchUserPermissions = async (userId) => {
    try {
      setPermissionsLoading(true)
      const response = await userService.getUserPermissions(userId)
      if (response.data.success) {
        const perms = response.data.permissions || []
        // Transform API permissions array to component format
        const formattedPerms = {
          primaryCases: {
            enabled: false,
            view: false,
            add: false,
            edit: false,
            delete: false
          },
          appealCases: {
            enabled: false
          },
          userManagement: {
            enabled: false,
            view: false,
            edit: false
          }
        }
        
        perms.forEach(perm => {
          if (perm.module === 'primary_cases' || perm.module === 'primaryCases') {
            formattedPerms.primaryCases = {
              enabled: perm.enabled || false,
              view: perm.view || false,
              add: perm.add || false,
              edit: perm.edit || false,
              delete: perm.delete || false
            }
          } else if (perm.module === 'appeal_cases' || perm.module === 'appealCases') {
            formattedPerms.appealCases = {
              enabled: perm.enabled || false
            }
          } else if (perm.module === 'user_management' || perm.module === 'userManagement') {
            formattedPerms.userManagement = {
              enabled: perm.enabled || false,
              view: perm.view || false,
              edit: perm.edit || false
            }
          }
        })
        
        setPermissions(formattedPerms)
      }
    } catch (err) {
      console.error('Error fetching user permissions:', err)
      setPermissions({
        primaryCases: { enabled: false, view: false, add: false, edit: false, delete: false },
        appealCases: { enabled: false },
        userManagement: { enabled: false, view: false, edit: false }
      })
    } finally {
      setPermissionsLoading(false)
    }
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setSelectedUserId(user.id)
    setRole(user.role)
  }

  const handleSavePermissions = async () => {
    if (!selectedUserId) return
    
    try {
      setSaving(true)
      // Transform component format to API format
      const apiPermissions = [
        {
          module: 'primary_cases',
          enabled: permissions.primaryCases.enabled,
          view: permissions.primaryCases.view,
          add: permissions.primaryCases.add,
          edit: permissions.primaryCases.edit,
          delete: permissions.primaryCases.delete
        },
        {
          module: 'appeal_cases',
          enabled: permissions.appealCases.enabled
        },
        {
          module: 'user_management',
          enabled: permissions.userManagement.enabled,
          view: permissions.userManagement.view,
          edit: permissions.userManagement.edit
        }
      ]
      
      await userService.updateUserPermissions(selectedUserId, apiPermissions)
      alert('تم حفظ الصلاحيات بنجاح')
    } catch (err) {
      console.error('Error saving permissions:', err)
      alert('فشل في حفظ الصلاحيات')
    } finally {
      setSaving(false)
    }
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'الإعدادات', path: '/settings' },
    { label: 'إدارة الصلاحيات' }
  ]

  const togglePermission = (section, field) => {
    setPermissions(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }))
  }

  const toggleSection = (section) => {
    setPermissions(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        enabled: !prev[section].enabled
      }
    }))
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
          <Button variant="primary" icon="person_add">إضافة مستخدم</Button>
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
                            {USER_ROLE_LABELS[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">نشط</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button className="text-primary hover:text-blue-700 p-2 rounded-full hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">edit_square</span>
                          </button>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">تعديل الصلاحيات</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  تخصيص الوصول للمستخدم: <span className="font-semibold text-primary">{selectedUser?.name || 'اختر مستخدم'}</span>
                </p>
              </div>
            </div>

            <div className="p-6 pb-2 shrink-0">
              <Select
                label="قالب الدور الوظيفي"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={Object.entries(USER_ROLES).map(([key, value]) => ({
                  value,
                  label: USER_ROLE_LABELS[value]
                }))}
              />
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-slate-500">gavel</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">إدارة القضايا</h4>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">القضايا الابتدائية</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.primaryCases.enabled}
                        onChange={() => toggleSection('primaryCases')}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {permissions.primaryCases.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      {['view', 'add', 'edit', 'delete'].map((perm) => (
                        <label key={perm} className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={permissions.primaryCases[perm] || false}
                            onChange={() => togglePermission('primaryCases', perm)}
                            className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          <span className={`text-xs font-medium ${perm === 'delete' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            {perm === 'view' ? 'عرض التفاصيل' :
                             perm === 'add' ? 'إضافة جلسات' :
                             perm === 'edit' ? 'تعديل البيانات' :
                             'حذف القضية'}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-slate-500">admin_panel_settings</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">إدارة النظام</h4>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">إدارة المستخدمين</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.userManagement.enabled}
                        onChange={() => toggleSection('userManagement')}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {permissions.userManagement.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={permissions.userManagement.view || false}
                          onChange={() => togglePermission('userManagement', 'view')}
                          className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">عرض القائمة</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={permissions.userManagement.edit || false}
                          onChange={() => togglePermission('userManagement', 'edit')}
                          className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">تعديل الصلاحيات</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl flex justify-end gap-3 shrink-0">
              <Button variant="secondary" disabled={!selectedUserId}>إلغاء</Button>
              <Button 
                variant="primary" 
                icon="save" 
                onClick={handleSavePermissions}
                disabled={!selectedUserId || saving || permissionsLoading}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default UserPermissions

