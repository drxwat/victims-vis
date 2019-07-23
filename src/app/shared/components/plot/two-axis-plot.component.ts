import { ElementRef } from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { Selection } from 'd3-selection';
import { PlotComponent, PlotConfiguration, Size } from './plot.component';

/**
 * Creates X & Y axises and inner G element for chart just inside the axises
 */
export abstract class TwoAxisPlotComponent extends PlotComponent {

  protected axisX: Selection<SVGGElement, unknown, null, undefined>;
  protected axisY: Selection<SVGGElement, unknown, null, undefined>;
  protected axisXSize: DOMRect;
  protected axisYSize: DOMRect;
  protected chartRoot: Selection<SVGGElement, unknown, null, undefined>;

  private __innerSize: Size;
  protected get innerSize() {
    if (!this.__innerSize) {
      this.__innerSize = {
        W: this.size.W - (this.MARGIN_LEFT + this.MARGIN_RIGHT) - this.axisYSize.width,
        H: this.size.H - (this.MARGIN_TOP + this.MARGIN_BOTTOM)
      };
    }
    return this.__innerSize;
  }

  constructor(componentEl: ElementRef, protected config?: PlotConfiguration) {
    super(componentEl, config);
  }

  protected drawAxises(
    scaleX: ScaleContinuousNumeric<any, any> | ScaleBand<any>,
    scaleY: ScaleContinuousNumeric<any, any> | ScaleBand<any>
  ) {
    this.axisX = this.plotRoot.append('g')
      .call(axisBottom(scaleX).ticks(this.size.W / 30));

    this.axisY = this.plotRoot.append('g')
      .call(axisLeft(scaleY).ticks(this.size.H / 25));

    this.axisXSize = (this.axisX.node() as SVGGElement).getBBox();
    this.axisYSize = (this.axisY.node() as SVGGElement).getBBox();

    const yWidth = this.axisYSize.width;

    this.axisX.attr('transform', `translate(${yWidth + this.MARGIN_LEFT}, ${this.size.H - this.MARGIN_BOTTOM})`);
    this.axisY.attr('transform', `translate(${yWidth + this.MARGIN_LEFT}, ${this.MARGIN_TOP})`);

    this.chartRoot = this.plotRoot
      .append('g')
      .attr('transform', `translate(${yWidth + this.MARGIN_LEFT}, ${this.MARGIN_TOP})`);
  }
}
