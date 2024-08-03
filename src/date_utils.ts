function toDate(dateString: string | number): Date {
  // if the dateString is actually a number only the year is given
  if (typeof dateString === 'number') {
    return new Date(dateString, 0, 1);
  }

  // a complete date is given
  const [day, month, year] = dateString.split('.').map(Number);
  const date = new Date(year, month - 1, day); // month is zero-based
  return date;
}

export function getAge(born: number | string, died: number | string): number {
  const bornDate = toDate(born);
  const diedDate = toDate(died);

  const diff = diedDate.valueOf() - bornDate.valueOf();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function formatDate(dateValue: number | string): string {
  // if the dateString is actually a number
  if (typeof dateValue === 'number') {
    return dateValue.toString();
  }

  // a complete date is given
  const [day, month, year] = dateValue.split('.').map(Number);
  const date = new Date(year, month - 1, day); // month is zero-based

  const formatter = new Intl.DateTimeFormat('de', { dateStyle: 'medium' });
  return formatter.format(date);
}
