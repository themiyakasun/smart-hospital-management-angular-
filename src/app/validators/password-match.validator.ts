import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMisMatch: true });
    return { passwordMisMatch: true };
  }

  if (confirmPassword.hasError('passwordMisMatch')) {
    const remainingErrors = { ...confirmPassword.errors };
    delete remainingErrors['passwordMisMatch'];
    confirmPassword.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
  }
  return null;
};
