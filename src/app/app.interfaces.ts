
declare type CrimeType =
  'Нападение' | 'Угрозы' | 'Грабеж и разбой' |
  'Кража' | 'Мошенничество' | 'Удаленное мошенничество' |
  'Прочее' | 'Недостаточно информации';

declare type IntBool = 0 | 1;

export interface DataEntity {
  crime_type: CrimeType,
  resp_age: number,
  resp_is_male: IntBool,
}