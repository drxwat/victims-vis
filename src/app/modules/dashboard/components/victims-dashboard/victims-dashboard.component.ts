import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CrimeType, DataEntity } from '@shared/app.interfaces';
import { mean } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { curveBasis, line } from 'd3-shape';
import { transition } from 'd3-transition';

const MARGIN = 50;
const SIZE = { h: 500, w: 500 };


@Component({
  selector: 'app-victims-dashboard',
  templateUrl: './victims-dashboard.component.html',
  styleUrls: ['./victims-dashboard.component.css']
})
export class VictimsDashboardComponent implements AfterViewInit {

  @ViewChild('chart', { read: ElementRef, static: false })
  private chartEl: ElementRef;
  private chartRoot: Selection<SVGGElement, unknown, null, undefined>;
  private chartCurve: any;
  private scales: { x: ScaleLinear<number, number>, y: ScaleLinear<number, number> };

  private data?: DataEntity[];

  constructor() {
  }

  async ngOnInit() {
  }

  async ngAfterViewInit() {
    this.data = await csv('assets/web_subset.csv', {}, (rawRow) => {
      const entityRow: DataEntity = {
        crime_type: rawRow.crime_type as DataEntity['crime_type'],
        resp_age: +rawRow.resp_age,
        resp_is_male: +rawRow.resp_is_male as DataEntity['resp_is_male']
      };
      return entityRow;
    });

    this.chartRoot = select(this.chartEl.nativeElement)
      .append('svg')
      .attr('width', SIZE.w + (2 * MARGIN))
      .attr('height', SIZE.h + (2 * MARGIN))
      .append('g')
      .attr('transform', `translate(${MARGIN}, ${MARGIN})`);

    this.scales = {
      x: scaleLinear().domain([0, 90]).range([0, SIZE.w]),
      y: scaleLinear().domain([0, 0.04]).range([SIZE.h, 0])
    }

    // Adding X axis
    this.chartRoot.append('g')
      .attr('transform', `translate(0, ${SIZE.w})`)
      .call(axisBottom(this.scales.x));

    this.chartRoot.append('g')
      .call(axisLeft(this.scales.y));

    // Compute kernel density estimation
    let kde = this.kernelDensityEstimator(
      this.kernelEpanechnikov(7),
      this.scales.x.ticks(40)
    );
    let density = kde(this.data.map((d) => d.resp_age));

    this.chartCurve = this.chartRoot.append('path')
      .datum(density)
      .attr('class', 'age-density-curve')
      .attr('fill', '#69b3a2')
      .attr('opacity', '.8')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .attr('d', line()
        .curve(curveBasis)
        .x((d) => this.scales.x(d[0]))
        .y((d) => this.scales.y(d[1]))
      );

    setTimeout(() => this.onCrimeTypeChange('Грабеж и разбой'), 1000);
  }

  onCrimeTypeChange(crimeType: CrimeType) {
    const subData = this.data
      .filter((d) => d.crime_type === crimeType)
      .map((d) => d.resp_age);

    let kde = this.kernelDensityEstimator(this.kernelEpanechnikov(7), this.scales.x.ticks(40));
    let density = kde(subData);

    this.chartCurve.datum(density);

    transition().select('.age-density-curve')
      .duration(700)
      .attr('d', line()
        .curve(curveBasis)
        .x((d) => this.scales.x(d[0]))
        .y((d) => this.scales.y(d[1]))
      );
  }

  private kernelDensityEstimator(kernel: (v: number) => number, X: number[]) {
    return function KDE(V: number[]) {
      return X.map((x) => [x, mean(V, (v) => kernel(x - v))]);
    };
  }
  private kernelEpanechnikov(k: number) {
    return (v: number) => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  }

}
