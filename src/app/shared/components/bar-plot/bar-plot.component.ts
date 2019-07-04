import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { DataGroupCount, DataGroupsCount } from '@shared/app.interfaces';
import { axisBottom, axisLeft } from 'd3-axis';
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from 'd3-scale';
import { select, selectAll, Selection } from 'd3-selection';
import { transition, Transition } from 'd3-transition';
import { PlotComponent } from '../plot/plot.component';

const ANIMATION_DURATION = 700;

@Component({
  selector: 'app-bar-plot',
  templateUrl: './bar-plot.component.html',
  styleUrls: ['./bar-plot.component.css']
})
export class BarPlotComponent extends PlotComponent {

  @Input() dataGroupsCount: DataGroupsCount = [];

  private scaleX: ScaleBand<string>;
  private scaleY: ScaleLinear<number, number>;

  private barsGroup: Selection<SVGGElement, unknown, null, undefined>;

  constructor(componentEl: ElementRef) {
    super(componentEl, 50);

    this.isReady.then(() => {
      this.initPlot();
      this.initScales(this.dataGroupsCount);
      this.drawAxises();
      this.initBars();
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
      .range([0, this.size.W])
      .padding(0.2)

    const maxY = Math.max(...data.map((d) => d[1]));
    this.scaleY = scaleLinear()
      .domain([0, maxY + (maxY * 0.10)])
      .range([this.size.H, 0])
  }

  private drawAxises() {
    this.plotRoot.append('g')
      .attr('transform', `translate(0, ${this.size.H})`)
      .call(axisBottom(this.scaleX));

    this.plotRoot.append('g')
      .call(axisLeft(this.scaleY));
  }

  private initBars() {
    this.barsGroup = this.plotRoot.append('g');
    this.barsGroup.on('mouseleave', this.onMouseLeave);

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

    (transition.call(rectSelection) as Transition<SVGRectElement, DataGroupCount, null, undefined>)
      .selectAll(() => rectSelection.nodes())
      .duration(duration)
      .delay((_, i) => i * 100)
      .attr("x", (d: DataGroupCount) => this.scaleX(d[0]) as number)
      .attr("y", (d: DataGroupCount) => this.scaleY(d[1]) as number)
      .attr("width", this.scaleX.bandwidth())
      .attr("height", (d: DataGroupCount) => this.size.H - this.scaleY(d[1]))
      .attr("fill", "#20c997")
      .attr('opacity', '.8');
  }

  private onMouseOver(data: DataGroupCount, selectedIndex: number, nodes: SVGRectElement[]) {
    const selectedNode = [...nodes].splice(selectedIndex, 1)[0];
    selectAll(nodes).style('opacity', 0.2);
    select(selectedNode).style('opacity', 0.8);
  }

  private onMouseLeave(data: DataGroupCount, selectedIndex: number, nodes: SVGRectElement[]) {
    console.log(event as Event);
    selectAll('rect').style('opacity', 0.8);
  }
}
