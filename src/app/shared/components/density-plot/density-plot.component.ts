import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { max, mean } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { curveBasis, line } from 'd3-shape';
import { transition } from 'd3-transition';

declare type DataVector = number[];
declare type Density = number[][];
declare type KernelDensityEstimator = (data: DataVector) => Density;

/**
 * После получения данных сначала нарисовать линию вдоль X а затем анимировать
 * поднятие до текущего значения
 */
const MARGIN = 50;
const SIZE = { h: 300, w: 400 }; // TODO: remove
const CURVE_CLASS = 'age-density-curve'; // TODO: make unique

@Component({
  selector: 'app-density-plot',
  templateUrl: './density-plot.component.html',
  styleUrls: ['./density-plot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DensityPlotComponent implements AfterViewInit, OnChanges {

  @Input() dataVector: DataVector = [];
  @Input() viewWidth: number;
  @Input() viewHeight: number

  @ViewChild('plot', { read: ElementRef, static: false })
  private plotEl: ElementRef;
  private plotRoot: Selection<SVGGElement, unknown, null, undefined>;
  private plotCurve: any;

  private scaleX: ScaleLinear<number, number>;
  private scaleY: ScaleLinear<number, number>;

  private kde: KernelDensityEstimator;
  private density: Density;

  private isInitialized = false;
  private isReady: Promise<any>;
  private dataIsReady: () => void;
  private viewIsReady: () => void;

  constructor() {
    this.isReady = Promise.all([
      new Promise((res) => { this.dataIsReady = res }),
      new Promise((res) => { this.viewIsReady = res })
    ]);

    this.isReady.then(() => {
      this.init();
      // zero line for animation
      this.drawCurve(this.density.map((d) => [d[0], 0]));
      this.isInitialized = true;
      this.drawCurve(this.density);
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    const isDataValid = !this.isInitialized &&
      Array.isArray(changes.dataVector.currentValue) &&
      changes.dataVector.currentValue.length > 0;

    if (isDataValid) {
      this.dataIsReady();
    }

    if (this.isInitialized) {
      this.redrawCurve();
    }
  }

  async ngAfterViewInit() {
    this.viewIsReady();
  }

  /**
   * High level API
   */

  private init() {
    this.initPlot();
    this.initScaleX(this.dataVector);
    this.initKDE(this.scaleX);
    this.calculateDensity(this.dataVector, this.kde);
    this.initScaleY(this.density);
    this.drawAxises();
    this.initCurve();
  }

  private redrawCurve() {
    this.calculateDensity(this.dataVector, this.kde);
    this.drawCurve(this.density);
  }

  /**
   * Low level API
   */

  private initPlot() {
    this.plotRoot = select(this.plotEl.nativeElement)
      .attr('viewBox', `0 0 ${SIZE.w + MARGIN} ${SIZE.h + MARGIN}`)
      .append('g')
      .attr('transform', `translate(${MARGIN}, 0)`);
  }

  private initScaleX(data: DataVector) {
    const maxVal = max(data) as number;
    this.scaleX = scaleLinear()
      .domain([0, maxVal + (0.10 * maxVal)])
      .range([0, SIZE.w]);
  }

  private initScaleY(density: Density) {
    const values = density.map((d) => d[1]);
    const maxVal = max(values) as number;
    this.scaleY = scaleLinear()
      .domain([0, maxVal + (0.10 * maxVal)])
      .range([SIZE.h, 0])
  }

  private initKDE(scaleX: ScaleLinear<number, number>) {
    this.kde = this.kernelDensityEstimator(
      this.kernelEpanechnikov(7),
      scaleX.ticks(40)
    );
  }

  private calculateDensity(data: DataVector, kde: KernelDensityEstimator) {
    this.density = kde(data);
  }

  private drawAxises() {
    this.plotRoot.append('g')
      .attr('transform', `translate(0, ${SIZE.h})`)
      .call(axisBottom(this.scaleX));

    this.plotRoot.append('g')
      .call(axisLeft(this.scaleY));
  }

  private initCurve() {
    this.plotCurve = this.plotRoot.append('path')
      .attr('class', CURVE_CLASS)
      .attr('fill', '#20c997')
      .attr('opacity', '.8')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round');
  }

  private drawCurve(density: Density) {

    transition.call(this.plotCurve.datum(density))
      .select(() => this.plotCurve.node())
      .duration(700)
      .attr('d', line()
        .curve(curveBasis)
        .x((d) => this.scaleX(d[0]))
        .y((d) => this.scaleY(d[1]))
      );
  }

  /** 
   * Math helpers
   */

  private kernelDensityEstimator(kernel: (v: number) => number, X: number[]): KernelDensityEstimator {
    return function KDE(V: number[]): Density {
      return X.map((x) => [x, mean(V, (v) => kernel(x - v)) as number]);
    };
  }
  private kernelEpanechnikov(k: number) {
    return (v: number) => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  }

}
