import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { dataEntriesToGroupsCountMap, groupsCountMapToDataBiGroupCount, groupsCountMapToOrderedDataGroupCount } from '@shared/app.data-helpers';
import { EDUCATION_ORDERED, INCOME_ORDERED, SOCIAL_STATUS } from '@shared/app.data-meta';
import { CrimeType, DataEntity } from '@shared/app.interfaces';
import { csv } from 'd3-fetch';
import { BehaviorSubject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Component({
  selector: 'app-victims-dashboard',
  templateUrl: './victims-dashboard.component.html',
  styleUrls: ['./victims-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VictimsDashboardComponent implements OnInit {

  private data$ = new BehaviorSubject<DataEntity[]>([]);

  loaded$ = this.data$.pipe(map((d) => !!d));

  /**
   * Display data
   */

  age$ = this.data$.pipe(map((d) => d.map((row) => row.resp_age)));

  income$ = this.data$.pipe(
    map(dataEntriesToGroupsCountMap('resp_income')),
    map(groupsCountMapToOrderedDataGroupCount(INCOME_ORDERED))
  );

  population$ = this.data$.pipe(map((d) => {
    return d.map((row) => row.resp_place_population).filter((p) => p !== 'NA');
  }));

  isMale$ = this.data$.pipe(
    map(dataEntriesToGroupsCountMap('resp_is_male')),
    map(groupsCountMapToDataBiGroupCount('Женщины', 'Мужчины'))
  );

  isCity$ = this.data$.pipe(
    map(dataEntriesToGroupsCountMap('resp_place_is_city')),
    map(groupsCountMapToDataBiGroupCount('Город', 'Не Город'))
  );

  education$ = this.data$.pipe(
    map(dataEntriesToGroupsCountMap('resp_edu')),
    map(groupsCountMapToOrderedDataGroupCount(EDUCATION_ORDERED))
  );

  socialStatus$ = this.data$.pipe(
    map(dataEntriesToGroupsCountMap('resp_ses')),
    map(groupsCountMapToOrderedDataGroupCount(SOCIAL_STATUS))
  );

  /**
   * Filters data
   */

  crimeTypes$ = this.data$.pipe(
    filter((d) => d.length > 0),
    take(1),
    map((d) => new Set(d.map((row) => row.crime_type)))
  );

  filtersGroup = new FormGroup({
    crimeType: new FormControl()
  });

  async ngOnInit() {
    const data = await csv<DataEntity, keyof DataEntity>('assets/web_subset.csv', {},
      (rawRow) => {
        const entityRow: DataEntity = {
          crime_type: rawRow.crime_type as CrimeType,
          resp_age: +(rawRow.resp_age as string),
          resp_is_male: rawRow.resp_is_male as '0' | '1',
          resp_income: rawRow.resp_income as string,
          resp_place_population: this.castToInt(rawRow.resp_place_population as string),
          resp_place_is_city: rawRow.resp_place_is_city as '0' | '1' | 'NA',
          resp_edu: rawRow.resp_edu as string,
          resp_ses: rawRow.resp_ses as string
        };
        return entityRow;
      });
    this.data$.next(data);

    this.filtersGroup.valueChanges.subscribe((filterValue) => {
      const subData = data.filter((row) => row.crime_type === filterValue['crimeType']);
      this.data$.next(subData);
    });
  }

  private castToInt(value: string | 'NA') {
    if (value !== 'NA') {
      return +value;
    }
    return value;
  }
}
