export const APPEALED_PARTIES = {
  TGA:1 ,
  COMPANY: 2
  
}


export const APPEALED_PARTIES_LABLES = {
  [APPEALED_PARTIES.COMPANY]: 'الشركة',
  [APPEALED_PARTIES.TGA]: 'هيئة النقل'
  
}

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
  CANCELED: 1,
  REJECTED: 2,
  POSTPONED:3,
  ACCEPTED: 4,
  
  PENDING: null
}

export const JUDGMENT_LABELS = {
  [JUDGMENT_TYPES.CANCELED]: 'الغاء القرار',
  [JUDGMENT_TYPES.REJECTED]: 'رفض الدعوة',
  [JUDGMENT_TYPES.POSTPONED]: 'تاجيل الدعوة',
  [JUDGMENT_TYPES.PENDING]: 'قيد المعالجة'
}

export const JUDGMENT_LABELS_APPEAL = {

  [JUDGMENT_TYPES.ACCEPTED]: 'بتأييد الحكم',
  [JUDGMENT_TYPES.CANCELED]: 'الغاء الحكم',
  [JUDGMENT_TYPES.PENDING]: 'قيد المعالجة'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer'
}

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'مدير نظام',
  [USER_ROLES.USER]: 'مستخدم',
  [USER_ROLES.VIEWER]: 'مشاهد',
  // Map old roles to user for backward compatibility
  'lawyer': 'مستخدم',
  'trainee': 'مستخدم',
  'clerk': 'مستخدم'
}

