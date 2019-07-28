import { ChangeDetectionStrategy, Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ANIMATION_DURATION, DEFAULT_MARGIN_BOTTOM, DEFAULT_MARGIN_LEFT, DEFAULT_MARGIN_RIGHT, DEFAULT_MARGIN_TOP, ESTIMATED_AXIS_FRAQ as DEFAULT_ESTIMATED_AXIS_FRAQ } from '@shared/app.constants';
import { max, mean } from 'd3-array';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { curveBasis, line } from 'd3-shape';
import { transition } from 'd3-transition';
import { TwoAxisPlotComponent } from '../plot/two-axis-plot.component';

export declare type DataVector = number[];
declare type Density = [number, number][];
declare type KernelDensityEstimator = (data: DataVector) => Density;

const WIDTH_OCCUPATION = 1 - (DEFAULT_MARGIN_LEFT + DEFAULT_MARGIN_RIGHT);
const HEIGHT_OCCUPATION = 1 - (DEFAULT_MARGIN_TOP + DEFAULT_MARGIN_BOTTOM);

const ESTIMATED_AXIS_FRAQ = DEFAULT_ESTIMATED_AXIS_FRAQ * 1.5;

@Component({
  selector: 'app-density-plot',
  templateUrl: './density-plot.component.html',
  styleUrls: ['./density-plot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DensityPlotComponent extends TwoAxisPlotComponent {

  @Input() plotTitle = '';
  @Input() xAxisText = '';
  @Input() dataVector: DataVector = [];

  private plotCurve: any;

  private scaleX: ScaleLinear<number, number>;
  private scaleY: ScaleLinear<number, number>;

  private kde: KernelDensityEstimator;
  private density: Density;

  constructor(componentEl: ElementRef) {
    super(componentEl, {
      MARGIN_TOP: DEFAULT_MARGIN_TOP,
      MARGIN_RIGHT: DEFAULT_MARGIN_RIGHT,
      MARGIN_BOTTOM: DEFAULT_MARGIN_BOTTOM,
      MARGIN_LEFT: DEFAULT_MARGIN_LEFT
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
    this.initLegend();
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
      .domain([0, maxVal])
      .range([0, this.size.W * (WIDTH_OCCUPATION - ESTIMATED_AXIS_FRAQ)]);
  }

  private initScaleY(density: Density) {
    const values = density.map((d) => d[1]);
    const maxVal = max(values) as number;
    this.scaleY = scaleLinear()
      .domain([0, maxVal + (0.20 * maxVal)])
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
    let ln = line()
      .curve(curveBasis)
      .x((d) => this.scaleX(d[0]))
      .y((d) => this.scaleY(d[1]))(density) as string;

    // Forcing line to go by X axis
    ln = `M 0,${this.innerSize.H} L${ln.substring(1)} L ${this.size.W * (WIDTH_OCCUPATION - ESTIMATED_AXIS_FRAQ)},${this.innerSize.H}`;

    transition.call(this.plotCurve.datum(density))
      .select(() => this.plotCurve.node())
      .duration(ANIMATION_DURATION)
      .attr('d', ln);
  }

  private drawTitle() {
    let titleWidthFraqtion = this.plotTitle.length * 10 / this.innerSize.W;
    titleWidthFraqtion = titleWidthFraqtion < 0.9 ? titleWidthFraqtion : 0.9;
    this.chartRoot
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('lengthAdjust', 'spacingAndGlyphs')
      .attr('textLength', this.innerSize.W * titleWidthFraqtion)
      .attr('x', this.innerSize.W / 2)
      .attr('y', 0)
      .text(this.plotTitle)
  }

  private initLegend() {
    this.plotRoot
      .append('text')
      .attr('y', this.innerSize.H + this.axisXSize.height + (this.MARGIN_BOTTOM / 1.5))
      .style('font-size', '85%')
      .attr('x', this.innerSize.W / 2 + this.MARGIN_LEFT)
      .attr('text-anchor', 'middle')
      .text(this.xAxisText);
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
