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
  PENDING: null
}

export const JUDGMENT_LABELS = {
  [JUDGMENT_TYPES.CANCELED]: 'الغاء القرار',
  [JUDGMENT_TYPES.REJECTED]: 'رفض الدعوة',
  [JUDGMENT_TYPES.POSTPONED]: 'تاجيل الدعوة',
  [JUDGMENT_TYPES.PENDING]: 'قيد المعالجة'
}

// export const JUDGMENT_LABELS = {
//   [JUDGMENT_TYPES.FOR_PLAINTIFF]: 'لصالح المدعي',
//   [JUDGMENT_TYPES.AGAINST_PLAINTIFF]: 'ضد المدعي',
//   [JUDGMENT_TYPES.PENDING]: 'قيد النظر'
// }

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

