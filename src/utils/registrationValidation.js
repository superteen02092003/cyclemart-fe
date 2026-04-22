/**
 * Registration Form Validation Utilities
 * Validates email, fullName, phone, and password fields
 */

/**
 * Validate registration form
 * @param {Object} formData - { fullName, email, phone, password }
 * @returns {Object} - { field: errorMessage }
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};

  // Validate fullName
  if (!formData.fullName.trim()) {
    errors.fullName = 'Vui lòng nhập họ tên';
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }

  // Validate phone
  if (!formData.phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại';
  } else {
    const phoneDigits = formData.phone.replace(/\s/g, '');
    if (!/^0/.test(phoneDigits)) {
      errors.phone = 'SĐT phải bắt đầu bằng số 0';
    } else if (phoneDigits.length !== 10) {
      errors.phone = 'SĐT phải có đúng 10 chữ số';
    } else if (!/^0[0-9]{9}$/.test(phoneDigits)) {
      errors.phone = 'SĐT không hợp lệ';
    }
  }

  // Validate password
  if (!formData.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (!/(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/.test(formData.password)) {
    errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ IN HOA và 1 ký tự đặc biệt (@,#,$...)';
  }

  return errors;
};
