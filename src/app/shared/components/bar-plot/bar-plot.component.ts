import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ANIMATION_DURATION } from '@shared/app.constants';
import { DataGroupCount, DataGroupsCount } from '@shared/app.interfaces';
import { axisBottom, axisLeft } from 'd3-axis';
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from 'd3-scale';
import { select, selectAll, Selection } from 'd3-selection';
import { transition, Transition } from 'd3-transition';
import { PlotComponent } from '../plot/plot.component';

// TODO: ADD GETTERS FOR NEW HEIGHT & WIDTH AFTER AXIS POSITIONING

const WIDTH_OCCUPATION = 0.9;
const HEIGHT_OCCUPATION = 0.85;

@Component({
  selector: 'app-bar-plot',
  templateUrl: './bar-plot.component.html',
  styleUrls: ['./bar-plot.component.css']
})
export class BarPlotComponent extends PlotComponent {

  @Input() dataGroupsCount: DataGroupsCount = [];

  private scaleX: ScaleBand<string>;
  private scaleY: ScaleLinear<number, number>;

  private axisXSize: DOMRect;
  private axisYSize: DOMRect;

  private barsGroup: Selection<SVGGElement, unknown, null, undefined>;

  get MARGIN_LEFT() {
    return (this.size.W - (this.size.W * WIDTH_OCCUPATION)) / 2;
  }

  get MARGIN_TOP() {
    return (this.size.H - (this.size.H * HEIGHT_OCCUPATION)) / 2;
  }

  constructor(componentEl: ElementRef) {
    super(componentEl);

    this.isReady.then(() => {
      this.initPlot();
      this.initScales(this.dataGroupsCount);
      this.drawAxises();
      this.initBars(this.dataGroupsCount);
      this.drawBars(this.dataGroupsCount.map((d) => [d[0], 0]), 0);
      this.drawBars(this.dataGroupsCount, ANIMATION_DURATION);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    if (this.isInitialized && this.isInputDataValid(changes)) {
      this.drawBars(this.dataGroupsCount, ANIMATION_DURATION);
    }
  }

  protected isInputDataValid(changes: SimpleChanges) {
    return !this.isInitialized &&
      Array.isArray(changes.dataGroupsCount.currentValue) &&
      changes.dataGroupsCount.currentValue.length > 0;
  }

  private initScales(data: DataGroupsCount) {
    this.scaleX = scaleBand()
      .domain(data.map((d) => d[0]))
      .range([0, this.size.W * WIDTH_OCCUPATION])
      .padding(0.2)

    const maxY = Math.max(...data.map((d) => d[1]));
    this.scaleY = scaleLinear()
      .domain([0, maxY + (maxY * 0.10)])
      .range([this.size.H * HEIGHT_OCCUPATION, 0])
  }

  private drawAxises() {
    // X axis
    const axisX = this.plotRoot.append('g')
      .call(axisBottom(this.scaleX));

    const axisY = this.plotRoot.append('g')
      .call(axisLeft(this.scaleY));

    this.axisXSize = (axisX.node() as SVGGElement).getBBox();
    this.axisYSize = (axisY.node() as SVGGElement).getBBox();

    const yWidth = this.axisYSize.width;
    const xHeight = this.axisXSize.height;

    axisX.attr('transform', `translate(${yWidth + this.MARGIN_LEFT}, ${this.size.H - xHeight})`);
    axisY.attr('transform', `translate(${yWidth + this.MARGIN_LEFT}, ${-xHeight + (this.MARGIN_TOP * 2)})`);
  }

  private initBars(data: DataGroupsCount) {
    // creating bar with opacity to catch mouseleave correctly
    // it should be wider & higher then bars in all dimentions
    const xStart = this.scaleX(data[0][0]) as number;
    const xEnd = this.scaleX.bandwidth() * (data.length + 1);
    const margin = 20; // hack to catch mouseleave from broders of rect

    const translateLeft = this.axisYSize.width + this.MARGIN_LEFT;
    const translateTop = -(this.axisXSize.height);

    this.plotRoot.append('rect')
      .attr('x', xStart - margin)
      .attr('y', 0 - margin)
      .attr('width', xEnd + (2 * margin))
      .attr('height', this.size.H + (2 * margin))
      .attr('fill', 'none')
      .attr('opacity', '.2')
      .attr('visibility', 'visible')
      .attr('pointer-events', 'visible')
      .attr('transform', `translate(${translateLeft}, ${translateTop})`)
      .on('mouseleave', this.onMouseLeave.bind(this));

    this.barsGroup = this.plotRoot.append('g');
  }

  private drawBars(data: DataGroupsCount, duration = 0) {
    let rectSelection = this.barsGroup.selectAll<SVGRectElement, unknown>("rect")
      .data(data, (d: DataGroupCount) => d[0]);

    rectSelection.exit().remove();

    rectSelection = rectSelection
      .enter()
      .append("rect")
      .merge(rectSelection)
      .on('mouseover', this.onMouseOver);

    const translateLeft = this.axisYSize.width + this.MARGIN_LEFT;
    const translateTop = -(this.axisXSize.height);

    (transition.call(rectSelection) as Transition<SVGRectElement, DataGroupCount, null, undefined>)
      .selectAll(() => rectSelection.nodes())
      .duration(duration)
      .delay((_, i) => i * 100)
      .attr("x", (d: DataGroupCount) => this.scaleX(d[0]) as number)
      .attr("y", (d: DataGroupCount) => this.scaleY(d[1]) as number)
      .attr("width", this.scaleX.bandwidth())
      .attr("height", (d: DataGroupCount) => this.size.H - this.scaleY(d[1]))
      .attr('transform', `translate(${translateLeft}, ${translateTop})`)
      .attr("fill", "#20c997")
      .attr('stroke', '#fff')
      .attr('stroke-width', '3')
      .attr('opacity', 0.8);
  }

  private onMouseOver(data: DataGroupCount, selectedIndex: number, nodes: SVGRectElement[]) {
    const selectedNode = [...nodes].splice(selectedIndex, 1)[0];
    selectAll(nodes).attr('opacity', 0.2);
    select(selectedNode).attr('opacity', 0.8);
  }

  private onMouseLeave(data: DataGroupCount, selectedIndex: number, nodes: SVGRectElement[]) {
    const mouseEvent = event as MouseEvent;
    if (
      mouseEvent &&
      mouseEvent.relatedTarget &&
      (mouseEvent.relatedTarget as Element).nodeName !== 'rect'
    ) {
      this.barsGroup.selectAll('rect').attr('opacity', 0.8);
    }
  }
}
