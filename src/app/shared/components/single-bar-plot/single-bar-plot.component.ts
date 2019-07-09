import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ANIMATION_DURATION } from '@shared/app.constants';
import { DataBiGroupCount, DataGroupCount } from '@shared/app.interfaces';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { Selection } from 'd3-selection';
import { transition } from 'd3-transition';
import { HorizontalAxisPlotComponent } from '../plot/horizontal-axis-plot.component';

const WIDTH_OCCUPATION = 0.85;
const HEIGHT_OCCUPATION = 1;
const BAR_HEIGHT_PART = 6; // 1/N

@Component({
  selector: 'app-single-bar-plot',
  templateUrl: './single-bar-plot.component.html',
  styleUrls: ['./single-bar-plot.component.css']
})
export class SingleBarPlotComponent extends HorizontalAxisPlotComponent {

  @Input() dataBiGroupCount: DataBiGroupCount;

  private scaleX: ScaleLinear<number, number>;

  private bottomBar: Selection<SVGRectElement, unknown, null, undefined>;
  private upperBar: Selection<SVGRectElement, unknown, null, undefined>;

  constructor(componentEl: ElementRef) {
    super(componentEl, {
      WIDTH_OCCUPATION,
      HEIGHT_OCCUPATION
    });

    this.isReady.then(() => {
      this.initPlot();
      this.initScale(this.dataBiGroupCount);
      this.drawAxis(this.scaleX);
      this.initBars();
      this.drawUpperBar(this.dataBiGroupCount[0]);
    });
  }

  protected isInputDataValid(changes: SimpleChanges) {
    return !this.isInitialized &&
      Array.isArray(changes.dataBiGroupCount.currentValue) &&
      changes.dataBiGroupCount.currentValue.length > 0;
  }

  private initScale(data: DataBiGroupCount) {
    this.scaleX = scaleLinear()
      .domain([0, this.getDataSum(data)])
      .range([0, this.size.W * WIDTH_OCCUPATION]);
  }

  private getDataSum(data: DataBiGroupCount) {
    return data[0][1] + data[1][1];
  }

  private initBars() {
    // bottom bar
    const barHeight = this.innerSize.H / BAR_HEIGHT_PART;
    const barY = this.innerSize.H - this.axisXSize.height - barHeight;

    this.bottomBar = this.plotRoot
      .append('rect')
      .attr('x', 0)
      .attr('y', barY)
      .attr('width', this.size.W * WIDTH_OCCUPATION)
      .attr('height', barHeight)
      .attr('transform', `translate(${this.MARGIN_LEFT}, 0)`)
      .attr("fill", "#fff");

    // upper bar
    this.upperBar = this.plotRoot
      .append('rect')
      .attr('x', 0)
      .attr('y', barY)
      .attr('width', 0)
      .attr('height', barHeight)
      .attr('transform', `translate(${this.MARGIN_LEFT}, 0)`)
      .attr("fill", "#20c997");
  }

  private drawUpperBar(singleData: DataGroupCount) {
    transition.call(this.upperBar.datum(singleData))
      .select(() => this.upperBar.node())
      .duration(ANIMATION_DURATION * 1.5)
      .attr('width', (d: DataGroupCount) => this.scaleX(d[1]));
  }
}
