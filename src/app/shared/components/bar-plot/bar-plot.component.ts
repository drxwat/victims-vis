import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ANIMATION_DURATION } from '@shared/app.constants';
import { DataGroupCount, DataGroupsCount } from '@shared/app.interfaces';
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from 'd3-scale';
import { select, selectAll, Selection } from 'd3-selection';
import { Transition, transition } from 'd3-transition';
import { TwoAxisPlotComponent } from '../plot/two-axis-plot.component';

const WIDTH_OCCUPATION = 0.8;
const HEIGHT_OCCUPATION = 0.7;

@Component({
  selector: 'app-bar-plot',
  templateUrl: './bar-plot.component.html',
  styleUrls: ['./bar-plot.component.css']
})
export class BarPlotComponent extends TwoAxisPlotComponent {

  private _dataGroupsCount: DataGroupsCount = [];

  @Input() title: string = '';
  @Input() showGroupNames = false;

  @Input('dataGroupsCount')
  set dataGroupsCount(value: DataGroupsCount) {
    if (!value || value.length === 0) {
      return;
    }
    const sum = value.map((row) => row[1]).reduce((acc, val) => acc + val);
    this.groupNamesMap = value.map((row) => row[0]);
    this._dataGroupsCount = value.map(
      (row, i) => [this.showGroupNames ? row[0] : `${i}`, row[1] / sum]
    );
  };

  get dataGroupsCount() {
    return this._dataGroupsCount;
  }

  private scaleX: ScaleBand<string>;
  private scaleY: ScaleLinear<number, number>;

  private barsGroup: Selection<SVGGElement, unknown, null, undefined>;
  private legendText: Selection<SVGTextElement, unknown, null, undefined>;

  private groupNamesMap: string[] = [];

  constructor(componentEl: ElementRef) {
    super(componentEl, {
      WIDTH_OCCUPATION,
      HEIGHT_OCCUPATION
    });

    this.isReady.then(() => {
      this.initPlot();
      this.initScales(this.dataGroupsCount);
      this.drawAxises(this.scaleX, this.scaleY);
      if (!this.showGroupNames) {
        this.axisX.selectAll('text').style('display', 'none');
      }
      this.initBars(this.dataGroupsCount);
      this.drawBars(this.dataGroupsCount.map((d) => [d[0], 0]), 0);
      this.drawBars(this.dataGroupsCount, ANIMATION_DURATION);
      this.drawTitle();
      this.initLegend();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    if (this.isInitialized && this.isInputDataValid(changes)) {
      this.drawBars(this.dataGroupsCount, ANIMATION_DURATION);
    }
  }

  protected isInputDataValid(changes: SimpleChanges) {
    return Array.isArray(changes.dataGroupsCount.currentValue) &&
      changes.dataGroupsCount.currentValue.length > 0;
  }

  private initScales(data: DataGroupsCount) {
    this.scaleX = scaleBand()
      .domain(data.map((d) => d[0]))
      .range([0, this.size.W * WIDTH_OCCUPATION])
      .padding(0.2)

    const maxY = Math.max(...data.map((d) => d[1]));
    this.scaleY = scaleLinear()
      .domain([0, maxY + (maxY * 0.20)])
      .range([this.size.H * HEIGHT_OCCUPATION, 0])
  }

  private initBars(data: DataGroupsCount) {
    // creating bar with opacity to catch mouseleave correctly
    // it should be wider & higher then bars in all dimentions
    const xStart = this.scaleX(data[0][0]) as number;
    const xEnd = this.scaleX.bandwidth() * (data.length + 1);
    const margin = 20; // hack to catch mouseleave from broders of rect

    this.chartRoot.append('rect')
      .attr('x', xStart - margin)
      .attr('y', 0 - margin)
      .attr('width', xEnd + (2 * margin))
      .attr('height', this.innerSize.H + (2 * margin))
      .attr('fill', 'none')
      .attr('opacity', '.2')
      .attr('visibility', 'visible')
      .attr('pointer-events', 'visible')
    // .on('mouseleave', this.onMouseLeave.bind(this));

    this.chartRoot.on('mouseleave', this.onMouseLeave.bind(this));

    this.barsGroup = this.chartRoot.append('g');
  }

  private drawBars(data: DataGroupsCount, duration = 0) {
    let rectSelection = this.barsGroup.selectAll<SVGRectElement, unknown>("rect")
      .data(data, (d: DataGroupCount) => d[0]);

    rectSelection.exit().remove();

    rectSelection = rectSelection
      .enter()
      .append("rect")
      .merge(rectSelection)
      .on('mouseover', this.onMouseOver.bind(this));

    (transition.call(rectSelection) as Transition<SVGRectElement, DataGroupCount, null, undefined>)
      .selectAll(() => rectSelection.nodes())
      .duration(duration)
      .delay((_, i) => i * 100)
      .attr("x", (d: DataGroupCount) => this.scaleX(d[0]) as number)
      .attr("y", (d: DataGroupCount) => this.scaleY(d[1]) as number)
      .attr("width", this.scaleX.bandwidth())
      .attr("height", (d: DataGroupCount) => this.innerSize.H - this.scaleY(d[1]))
      .attr("fill", "#20c997")
      .attr('stroke', '#fff')
      .attr('stroke-width', '3')
      .attr('opacity', 0.8);
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
      .text(this.title);
  }

  private initLegend() {
    this.legendText = this.plotRoot
      .append('text')
      .attr('y', this.size.H - (this.MARGIN_TOP / 2))
      .style('font-size', '85%')
  }

  private onMouseOver(data: DataGroupCount, selectedIndex: number, nodes: SVGRectElement[]) {
    const selectedNode = [...nodes].splice(selectedIndex, 1)[0];
    selectAll(nodes).attr('opacity', 0.2);
    select(selectedNode).attr('opacity', 0.8);

    if (!this.showGroupNames) {
      const text = this.groupNamesMap[selectedIndex];
      const textArr = text.split(' ');

      let textData = [text];
      if (textArr.length > 4) {
        textData = [
          textArr.splice(0, Math.round(textArr.length / 2)).join(' '),
          textArr.join(' ')
        ];
      }

      const spansSelection = this.legendText
        .selectAll('tspan')
        .data(textData);

      spansSelection.exit().remove();
      spansSelection.enter()
        .append('tspan')
        .attr('dy', (d, i) => i * 15)
        .attr('x', this.size.W / 2 + (this.MARGIN_LEFT / 2))
        .attr('text-anchor', 'middle')
        .merge(spansSelection as any)
        .text((d) => d);
    }
  }

  private onMouseLeave(data: DataGroupCount, selectedIndex: number, nodes: SVGRectElement[]) {
    const mouseEvent = event as MouseEvent;
    if (
      mouseEvent &&
      mouseEvent.relatedTarget &&
      (mouseEvent.relatedTarget as Element).nodeName !== 'rect'
    ) {
      this.barsGroup.selectAll('rect').attr('opacity', 0.8);
      this.legendText.selectAll('tspan').remove();
    }
  }
}
