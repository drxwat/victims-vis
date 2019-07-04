
export declare type CrimeType =
  'Нападение' | 'Угрозы' | 'Грабеж и разбой' |
  'Кража' | 'Мошенничество' | 'Удаленное мошенничество' |
  'Прочее' | 'Недостаточно информации';

export declare type IntBool = 0 | 1;

export interface DataEntity {
  crime_type: CrimeType,
  resp_age: number,
  resp_is_male: IntBool,
  resp_income?: string
}
export declare type DataGroupCount = [string, number];
export declare type DataGroupsCount = DataGroupCount[];
