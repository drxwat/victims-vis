import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { INCOME_ORDERED } from '@shared/app.data-meta';
import { CrimeType, DataEntity, IntBool } from '@shared/app.interfaces';
import { csv } from 'd3-fetch';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const dataEntriesToGroupsCountMap = (d: DataEntity[]) => {
  return d.reduce<Map<string, number>>((map, row) => {
    if (!row.resp_income) {
      return map;
    }
    if (map.has(row.resp_income)) {
      map.set(row.resp_income, (map.get(row.resp_income) as number) + 1);
    } else {
      map.set(row.resp_income, 1);
    }
    return map;
  }, new Map())
}

@Component({
  selector: 'app-victims-dashboard',
  templateUrl: './victims-dashboard.component.html',
  styleUrls: ['./victims-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VictimsDashboardComponent implements OnInit {

  private data$ = new BehaviorSubject<DataEntity[]>([]);

  loaded$ = this.data$.pipe(map((d) => !!d));
  age$ = this.data$.pipe(map((d) => d.map((row) => row.resp_age)));

  income$ = this.data$.pipe(
    map(dataEntriesToGroupsCountMap),
    map((m) => {
      if (m.size === 0) {
        return [];
      }
      return [
        ...INCOME_ORDERED
      ].map<[string, number]>((i) => [i, m.get(i) || 0]);
    })
  );

  async ngOnInit() {
    const data = await csv<DataEntity, keyof DataEntity>('assets/web_subset.csv', {},
      (rawRow) => {
        const entityRow: DataEntity = {
          crime_type: rawRow.crime_type as CrimeType,
          resp_age: +(rawRow.resp_age as string),
          resp_is_male: +(rawRow.resp_is_male as '0' | '1') as IntBool,
          resp_income: rawRow.resp_income
        };
        return entityRow;
      });
    this.data$.next(data);
  }
}
