import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';
import { PlotComponent } from '../plot/plot.component';

@Component({
  selector: 'app-bar-plot',
  templateUrl: './bar-plot.component.html',
  styleUrls: ['./bar-plot.component.css']
})
export class BarPlotComponent extends PlotComponent {

  @Input() dataGroupsCount: [string, number][] = [];

  private scaleX: ScaleBand<string>;
  private scaleY: ScaleLinear<number, number>;

  constructor(componentEl: ElementRef) {
    super(componentEl, 50);

    this.isReady.then(() => {
      this.initPlot();
      this.initScales(this.dataGroupsCount)
      this.drawAxises();
      this.drawBars(this.dataGroupsCount.map((d) => [d[0], 0]), 0);
      this.drawBars(this.dataGroupsCount, 700);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    if (this.isInitialized) {
      // rerender bars
    }
  }

  protected isInputDataValid(changes: SimpleChanges) {
    return !this.isInitialized &&
      Array.isArray(changes.dataGroupsCount.currentValue) &&
      changes.dataGroupsCount.currentValue.length > 0;
  }

  private initScales(data: [string, number][]) {
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

  private drawBars(data: [string, number][], duration = 0) {

    let rectSelection = this.plotRoot.selectAll("rect")
      .data(data) as any;

    rectSelection = rectSelection
      .enter()
      .append("rect")
      .merge(rectSelection);

    transition.call(rectSelection)
      .selectAll(() => rectSelection.nodes())
      .duration(duration)
      .attr("x", (d: [string, number]) => this.scaleX(d[0]))
      .attr("y", (d: [string, number]) => this.scaleY(d[1]))
      .attr("width", this.scaleX.bandwidth())
      .attr("height", (d) => this.size.H - this.scaleY(d[1]))
      .attr("fill", "#20c997")
      .attr('opacity', '.8');
  }

}
