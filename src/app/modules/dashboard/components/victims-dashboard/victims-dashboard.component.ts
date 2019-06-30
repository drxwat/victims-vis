import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CrimeType, DataEntity, IntBool } from '@shared/app.interfaces';
import { csv } from 'd3-fetch';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

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

  async ngOnInit() {
    const data = await csv<DataEntity, keyof DataEntity>('assets/web_subset.csv', {},
      (rawRow) => {
        const entityRow: DataEntity = {
          crime_type: rawRow.crime_type as CrimeType,
          resp_age: +(rawRow.resp_age as string),
          resp_is_male: +(rawRow.resp_is_male as '0' | '1') as IntBool
        };
        return entityRow;
      });
    this.data$.next(data);
  }
}
