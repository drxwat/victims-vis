
export declare type CrimeType =
  'Нападение' | 'Угрозы' | 'Грабеж и разбой' |
  'Кража' | 'Мошенничество' | 'Удаленное мошенничество' |
  'Прочее' | 'Недостаточно информации';

export interface DataEntity {
  crime_type: CrimeType,
  resp_age: number,
  resp_is_male: '0' | '1',
  resp_income: string | 'NA',
  resp_place_population: number | 'NA',
  resp_place_is_city: '0' | '1' | 'NA',
  resp_edu: string,
  resp_ses: string,

}
export declare type DataGroupCount = [string, number];
export declare type DataGroupsCount = DataGroupCount[];
export declare type DataBiGroupCount = [DataGroupCount, DataGroupCount];
