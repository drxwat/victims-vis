import { ElementRef } from '@angular/core';
import { axisBottom } from 'd3-axis';
import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { Selection } from 'd3-selection';
import { PlotComponent, PlotConfiguration } from './plot.component';

export abstract class HorizontalAxisPlotComponent extends PlotComponent {

  protected chartRoot: Selection<SVGGElement, unknown, null, undefined>;
  protected axisXSize: DOMRect;

  constructor(componentEl: ElementRef, protected config?: PlotConfiguration) {

    super(componentEl, {
      WIDTH_OCCUPATION: config && config.WIDTH_OCCUPATION,
      HEIGHT_OCCUPATION: 1
    });
  }

  protected drawAxis(
    scaleX: ScaleContinuousNumeric<any, any> | ScaleBand<any>) {
    const axisX = this.plotRoot.append('g')
      .call(axisBottom(scaleX).ticks(this.size.W / 30));

    this.axisXSize = (axisX.node() as SVGGElement).getBBox();

    axisX.attr('transform', `translate(${this.MARGIN_LEFT}, ${this.size.H - this.MARGIN_TOP - this.axisXSize.height})`);

    this.chartRoot = this.plotRoot
      .append('g')
      .attr('transform', `translate(${this.MARGIN_LEFT}, ${this.MARGIN_TOP})`);
  }
}
