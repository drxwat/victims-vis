
export declare type CrimeType =
  'Нападение' | 'Угрозы' | 'Грабеж и разбой' |
  'Кража' | 'Мошенничество' | 'Удаленное мошенничество' |
  'Прочее' | 'Недостаточно информации';

export interface DataEntity {
  crime_type: CrimeType,
  crime_place_grouped: string,
  resp_age: number,
  resp_is_male: '0' | '1',
  resp_income: string | 'NA',
  resp_place_is_city: '0' | '1' | 'NA',
  resp_edu: string,
  resp_ses: string,
  victim_is_reporting: '0' | '1' | 'NA',
  victim_is_crime_case_initiated: '0' | '1' | 'NA'
}
export declare type DataGroupCount = [string, number];
export declare type DataGroupsCount = DataGroupCount[];
export declare type DataBiGroupCount = [DataGroupCount, DataGroupCount];
