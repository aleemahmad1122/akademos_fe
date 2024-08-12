import { AbstractControl, ValidatorFn } from '@angular/forms';

export function dateNotBeforeToday(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset the time part to 00:00:00

    const inputDate = new Date(control.value);
    if (inputDate < today) {
      return { 'dateNotBeforeToday': { value: control.value } };
    }
    return null;
  };
}
