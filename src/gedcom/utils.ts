import { toDate } from '../date_utils.js';

export function toGedcomDate(dateValue: string | number): string {
  const date = toDate(dateValue);
  const a = date.getDate().toString();
  const day = a.padStart(2, '0'); // Ensure two-digit day
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
