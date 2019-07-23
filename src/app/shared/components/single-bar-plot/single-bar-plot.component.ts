import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ANIMATION_DURATION, DEFAULT_MARGIN_BOTTOM, DEFAULT_MARGIN_LEFT, DEFAULT_MARGIN_RIGHT, DEFAULT_MARGIN_TOP } from '@shared/app.constants';
import { DataBiGroupCount, DataGroupCount } from '@shared/app.interfaces';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { Selection } from 'd3-selection';
import { transition } from 'd3-transition';
import { HorizontalAxisPlotComponent } from '../plot/horizontal-axis-plot.component';

const WIDTH_OCCUPATION = 1 - (DEFAULT_MARGIN_LEFT + DEFAULT_MARGIN_RIGHT);
const HEIGHT_OCCUPATION = 1 - (DEFAULT_MARGIN_TOP + DEFAULT_MARGIN_BOTTOM);
const BAR_HEIGHT_PART = 3; // 1/N

@Component({
  selector: 'app-single-bar-plot',
  templateUrl: './single-bar-plot.component.html',
  styleUrls: ['./single-bar-plot.component.scss']
})
export class SingleBarPlotComponent extends HorizontalAxisPlotComponent {

  private _dataBiGroupCount: DataBiGroupCount;

  @Input() title: string = '';
  @Input() isAbsolute = false;

  @Input('dataBiGroupCount')
  set dataBiGroupCount(value: DataBiGroupCount) {
    if (!value || value.length !== 2) {
      return;
    }
    if (this.isAbsolute) {
      this._dataBiGroupCount = value;
      return;
    }
    const sum = this.getDataSum(value);
    this._dataBiGroupCount = value.map((row) => [row[0], row[1] / sum]) as DataBiGroupCount;
  };

  get dataBiGroupCount() {
    return this._dataBiGroupCount;
  }

  private scaleX: ScaleLinear<number, number>;

  private bottomBar: Selection<SVGRectElement, unknown, null, undefined>;
  private upperBar: Selection<SVGRectElement, unknown, null, undefined>;

  constructor(componentEl: ElementRef) {
    super(componentEl, {
      MARGIN_TOP: DEFAULT_MARGIN_TOP,
      MARGIN_RIGHT: DEFAULT_MARGIN_RIGHT,
      MARGIN_BOTTOM: DEFAULT_MARGIN_BOTTOM,
      MARGIN_LEFT: DEFAULT_MARGIN_LEFT
    });

    this.isReady.then(() => {
      this.initPlot();
      this.initScale(this.dataBiGroupCount);
      this.drawAxis(this.scaleX);
      this.initBars();
      this.drawUpperBar(this.dataBiGroupCount[0]);
      this.drawTitle();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    if (this.isInitialized && this.isInputDataValid(changes)) {
      this.drawUpperBar(this.dataBiGroupCount[0]);
    }
  }

  protected isInputDataValid(changes: SimpleChanges) {
    const val = changes.dataBiGroupCount.currentValue as DataBiGroupCount;
    return Array.isArray(val) &&
      Array.isArray(val[0]) &&
      Array.isArray(val[1]) &&
      (val[0][1] > 0 || val[1][1] > 0);
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

    this.bottomBar = this.chartRoot
      .append('rect')
      .attr('x', 0)
      .attr('y', barY)
      .attr('width', this.size.W * WIDTH_OCCUPATION)
      .attr('height', barHeight)
      .attr("fill", "#fff");

    // upper bar
    this.upperBar = this.chartRoot
      .append('rect')
      .attr('x', 0)
      .attr('y', barY)
      .attr('width', 0)
      .attr('height', barHeight)
      .attr("fill", "#20c997");
  }

  private drawUpperBar(singleData: DataGroupCount) {
    transition.call(this.upperBar.datum(singleData))
      .select(() => this.upperBar.node())
      .duration(ANIMATION_DURATION * 1.5)
      .attr('width', (d: DataGroupCount) => this.scaleX(d[1]));
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
      .attr('y', this.MARGIN_TOP)
      .text(this.title)
  }
}
