// Validation rules for role-specific signup requirements.

/**
 * Lecturer emails must end in ".edu" — a strong, non-negotiable requirement.
 * Matches e.g. "j.smith@university.edu" but rejects "j.smith@university.edu.co"
 * or "j.smith@gmail.com".
 */
export function isEduEmail(email: string): boolean {
  return /^[^\s@]+@([a-zA-Z0-9-]+\.)+edu$/.test(email.trim());
}

/**
 * Student registration numbers must contain at least one letter AND at least
 * one digit (e.g. "CS/2021/034", "ENG2022017"). Plain words or plain numbers
 * are rejected.
 */
export function isValidRegistrationNumber(regNumber: string): boolean {
  const value = regNumber.trim();
  const hasLetter = /[A-Za-z]/.test(value);
  const hasDigit = /\d/.test(value);
  const validChars = /^[A-Za-z0-9/-]+$/.test(value);
  return hasLetter && hasDigit && validChars && value.length >= 4;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
