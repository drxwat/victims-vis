import { Component, OnInit } from '@angular/core';
import { csv } from 'd3-fetch';
import { DataEntity } from './app.interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'victims-vis';

  private data;

  constructor() {
  }

  async ngOnInit() {
    this.data = await csv('assets/web_subset.csv', {}, (rawRow) => {
      const entityRow: DataEntity = {
        crime_type: rawRow.crime_type as DataEntity['crime_type'],
        resp_age: +rawRow.resp_age,
        resp_is_male: +rawRow.resp_is_male as DataEntity['resp_is_male']
      };
      return entityRow;
    });
  }
}
