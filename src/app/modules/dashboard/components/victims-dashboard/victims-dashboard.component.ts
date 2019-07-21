import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
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
  styleUrls: ['./victims-dashboard.component.scss'],
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
    return d
      .map((row) => row.resp_place_population)
      .filter((p) => p !== 'NA')
      .map((p) => p as number / 100000)
      .filter((p) => p < 100)
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

  crimePlaces$ = this.data$.pipe(
    filter((d) => d.length > 0),
    take(1),
    map((d) => new Set(d.map((row) => row.crime_place_grouped)))
  );

  filtersGroup = new FormGroup({
    crime_type: new FormControl(),
    crime_place_grouped: new FormControl()
  });

  /**
   * Layout
   */

  gridColumns: number = 3;

  @HostListener('window:resize') onWindowResize() {
    this.calculateGridsColumns();
  }

  async ngOnInit() {
    const data = await csv<DataEntity, keyof DataEntity>('assets/web_subset.csv', {},
      (rawRow) => {
        const entityRow: DataEntity = {
          crime_type: rawRow.crime_type as CrimeType,
          crime_place_grouped: rawRow.crime_place_grouped as string,
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

    this.filtersGroup.valueChanges.subscribe((filter) => {
      const subData = data.filter(
        (row) => {
          for (const filterKey in filter) {
            if (filter[filterKey] && row[filterKey] !== filter[filterKey]) {
              return false;
            }
          }
          return true;
        }
      );
      this.data$.next(subData);
    });

    this.calculateGridsColumns();
  }

  resetFilters() {
    this.filtersGroup.reset();
  }

  private castToInt(value: string | 'NA') {
    if (value !== 'NA') {
      return +value;
    }
    return value;
  }

  private calculateGridsColumns() {
    const windowWidth = window.innerWidth;
    if (windowWidth <= 767) {
      this.gridColumns = 1;
    } else if (windowWidth <= 1024) {
      this.gridColumns = 2;
    } else {
      this.gridColumns = 3;
    }
  }
}
