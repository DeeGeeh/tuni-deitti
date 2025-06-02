/**
 * Validates password strength and returns validation result
 * @param password The password to validate
 * @param confirmPassword The confirmation password to compare
 * @returns An object with validation result and error message if any
 */
export function validatePassword(
  password: string,
  confirmPassword?: string
): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Check if passwords match when confirmation is provided
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return {
      isValid: false,
      errorMessage: "Salasanat eivät täsmää",
    };
  }

  // Check password length (minimum 8 characters is common)
  if (password.length < 8) {
    return {
      isValid: false,
      errorMessage: "Salasanan tulee olla vähintään 8 merkkiä pitkä",
    };
  }

  // Check for password strength
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    return {
      isValid: false,
      errorMessage:
        "Salasanan tulee sisältää vähintään yksi iso kirjain, pieni kirjain, numero ja erikoismerkki",
    };
  }

  return { isValid: true };
}

/**
 * Validates that the email ends with @tuni.fi
 * @param email The email to validate
 * @returns An object with validation result and error message if any
 */
export function validateEmail(email: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      errorMessage: "Syötä kelvollinen sähköpostiosoite",
    };
  }

  // Check if email ends with @tuni.fi
  if (!email.endsWith("@tuni.fi")) {
    return {
      isValid: false,
      errorMessage: "Sähköpostiosoitteen tulee päättyä @tuni.fi",
    };
  }

  return { isValid: true };
}

/**
 * Validates the entire form input for registration
 * @param formData The form data to validate
 * @returns An object with validation result and error message if any
 */
export function validateRegistrationForm(formData: {
  email: string;
  password: string;
  confirmPassword: string;
}): {
  isValid: boolean;
  errorMessage?: string;
} {
  const { email, password, confirmPassword } = formData;

  // Check if all required fields are filled
  if (!email || !password || !confirmPassword) {
    return {
      isValid: false,
      errorMessage: "Ole hyvä ja täytä kaikki kentät",
    };
  }

  // Validate email format and domain
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  // Validate password
  const passwordValidation = validatePassword(password, confirmPassword);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true };
}
