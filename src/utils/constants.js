export const CASE_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  JUDGMENT: 'judgment',
  CLOSED: 'closed',
  POSTPONED: 'postponed'
}

export const CASE_STATUS_LABELS = {
  [CASE_STATUSES.ACTIVE]: 'قيد الإجراء',
  [CASE_STATUSES.PENDING]: 'معلقة',
  [CASE_STATUSES.JUDGMENT]: 'بانتظار الحكم',
  [CASE_STATUSES.CLOSED]: 'مغلقة',
  [CASE_STATUSES.POSTPONED]: 'مؤجلة'
}

export const JUDGMENT_TYPES = {
  FOR_PLAINTIFF: 1,
  AGAINST_PLAINTIFF: 2,
  PENDING: null
}

export const JUDGMENT_LABELS = {
  [JUDGMENT_TYPES.FOR_PLAINTIFF]: 'لصالح المدعي',
  [JUDGMENT_TYPES.AGAINST_PLAINTIFF]: 'ضد المدعي',
  [JUDGMENT_TYPES.PENDING]: 'قيد النظر'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  TRAINEE: 'trainee',
  CLERK: 'clerk'
}

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'مدير نظام',
  [USER_ROLES.LAWYER]: 'محامي أول',
  [USER_ROLES.TRAINEE]: 'محامي متدرب',
  [USER_ROLES.CLERK]: 'كاتب عدل'
}

