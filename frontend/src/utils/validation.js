export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validateRequired = (value) => {
  return value && value.trim().length > 0
}

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength
}

export const validateCaseForm = (formData) => {
  const errors = {}

  if (!validateRequired(formData.caseNumber)) {
    errors.caseNumber = 'رقم القضية مطلوب'
  }

  if (!validateRequired(formData.title)) {
    errors.title = 'عنوان القضية مطلوب'
  }

  // if (!validateRequired(formData.client)) {
  //   errors.client = 'اسم الموكل مطلوب'
  // }

  // if (!validateRequired(formData.opponent)) {
  //   errors.opponent = 'اسم الخصم مطلوب'
  // }

  if (!validateRequired(formData.registrationDate)) {
    errors.registrationDate = 'تاريخ التسجيل مطلوب'
  }

  // if (!formData.courtNumber || formData.courtNumber < 1) {
  //   errors.courtNumber = 'رقم الدائرة القضائية مطلوب'
  // }

  if (!validateRequired(formData.firstInstanceJudgment)) {
    errors.firstInstanceJudgment = 'حكم المحكمة الابتدائية مطلوب'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateLoginForm = (email, password) => {
  const errors = {}

  if (!validateEmail(email)) {
    errors.email = 'البريد الإلكتروني غير صحيح'
  }

  if (!validateRequired(email)) {
    errors.email = 'البريد الإلكتروني مطلوب'
  }

  if (!validateRequired(password)) {
    errors.password = 'كلمة المرور مطلوبة'
  }

  if (password && !validateMinLength(password, 6)) {
    errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

