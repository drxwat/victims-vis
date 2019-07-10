import { ElementRef } from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { Selection } from 'd3-selection';
import { PlotComponent, PlotConfiguration, Size } from './plot.component';

/**
 * Creates X & Y axises and inner G element for chart just inside the axises
 */
export abstract class TwoAxisPlotComponent extends PlotComponent {

  protected axisXSize: DOMRect;
  protected axisYSize: DOMRect;
  protected chartRoot: Selection<SVGGElement, unknown, null, undefined>;

  private __innerSize: Size;
  protected get innerSize() {
    if (!this.__innerSize) {
      this.__innerSize = {
        W: this.size.W - (this.MARGIN_LEFT * 2) - this.axisYSize.width,
        H: this.size.H - (this.MARGIN_TOP * 2)
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
    const axisX = this.plotRoot.append('g')
      .call(axisBottom(scaleX).ticks(this.size.W / 30));

    const axisY = this.plotRoot.append('g')
      .call(axisLeft(scaleY).ticks(this.size.H / 25));

    this.axisXSize = (axisX.node() as SVGGElement).getBBox();
    this.axisYSize = (axisY.node() as SVGGElement).getBBox();

    const yWidth = this.axisYSize.width;

    axisX.attr('transform', `translate(${yWidth + this.MARGIN_LEFT}, ${this.size.H - this.MARGIN_TOP})`);
    axisY.attr('transform', `translate(${yWidth + this.MARGIN_LEFT}, ${this.MARGIN_TOP})`);

    this.chartRoot = this.plotRoot
      .append('g')
      .attr('transform', `translate(${yWidth + this.MARGIN_LEFT}, ${this.MARGIN_TOP})`);
  }
}
