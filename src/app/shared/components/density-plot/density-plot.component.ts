import { ChangeDetectionStrategy, Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ANIMATION_DURATION } from '@shared/app.constants';
import { max, mean } from 'd3-array';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { transition } from 'd3-transition';
import { TwoAxisPlotComponent } from '../plot/two-axis-plot.component';

export declare type DataVector = number[];
declare type Density = number[][];
declare type KernelDensityEstimator = (data: DataVector) => Density;

const WIDTH_OCCUPATION = 0.8;
const HEIGHT_OCCUPATION = 0.8;


@Component({
  selector: 'app-density-plot',
  templateUrl: './density-plot.component.html',
  styleUrls: ['./density-plot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DensityPlotComponent extends TwoAxisPlotComponent {

  @Input() title: string = '';
  @Input() dataVector: DataVector = [];

  private plotCurve: any;

  private scaleX: ScaleLinear<number, number>;
  private scaleY: ScaleLinear<number, number>;

  private kde: KernelDensityEstimator;
  private density: Density;

  constructor(componentEl: ElementRef) {
    super(componentEl, {
      WIDTH_OCCUPATION,
      HEIGHT_OCCUPATION
    });

    this.isReady.then(() => {
      this.init();
      // // zero line for animation
      this.drawCurve(this.density.map((d) => [d[0], 0]));
      this.drawCurve(this.density);
      this.drawTitle();
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    if (this.isInitialized && this.isInputDataValid(changes)) {
      this.redrawCurve();
    }
  }

  protected isInputDataValid(changes: SimpleChanges) {
    return Array.isArray(changes.dataVector.currentValue) &&
      changes.dataVector.currentValue.length > 0;
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
    this.drawAxises(this.scaleX, this.scaleY);
    this.initCurve();
  }

  private redrawCurve() {
    this.calculateDensity(this.dataVector, this.kde);
    this.drawCurve(this.density);
  }

  /**
   * Low level API
   */

  private initScaleX(data: DataVector) {
    const maxVal = max(data) as number;
    this.scaleX = scaleLinear()
      .domain([0, maxVal + (0.10 * maxVal)])
      .range([0, this.size.W * WIDTH_OCCUPATION]);
  }

  private initScaleY(density: Density) {
    const values = density.map((d) => d[1]);
    const maxVal = max(values) as number;
    this.scaleY = scaleLinear()
      .domain([0, maxVal + (0.10 * maxVal)])
      .range([this.size.H * HEIGHT_OCCUPATION, 0])
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

  private initCurve() {
    this.plotCurve = this.chartRoot.append('path')
      .attr('fill', '#20c997')
      .attr('opacity', '.8')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round');
  }

  private drawCurve(density: Density) {

    transition.call(this.plotCurve.datum(density))
      .select(() => this.plotCurve.node())
      .duration(ANIMATION_DURATION)
      .attr('d', line()
        .curve(curveBasis)
        .x((d) => this.scaleX(d[0]))
        .y((d) => this.scaleY(d[1]))
      );
  }

  private drawTitle() {
    let titleWidthFraqtion = this.title.length * 10 / this.innerSize.W;
    titleWidthFraqtion = titleWidthFraqtion < 0.9 ? titleWidthFraqtion : 0.9;
    this.chartRoot
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('lengthAdjust', 'spacingAndGlyphs')
      .attr('textLength', this.innerSize.W * titleWidthFraqtion)
      .attr('x', this.innerSize.W / 2)
      .attr('y', 0)
      .text(this.title)
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
