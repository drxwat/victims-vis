import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ANIMATION_DURATION, DEFAULT_MARGIN_BOTTOM, DEFAULT_MARGIN_LEFT, DEFAULT_MARGIN_RIGHT, DEFAULT_MARGIN_TOP, ESTIMATED_AXIS_FRAQ } from '@shared/app.constants';
import { DataGroupCount, DataGroupsCount } from '@shared/app.interfaces';
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from 'd3-scale';
import { select, selectAll, Selection } from 'd3-selection';
import { Transition, transition } from 'd3-transition';
import { TwoAxisPlotComponent } from '../plot/two-axis-plot.component';

const WIDTH_OCCUPATION = 1 - (DEFAULT_MARGIN_LEFT + DEFAULT_MARGIN_RIGHT);
const HEIGHT_OCCUPATION = 1 - (DEFAULT_MARGIN_TOP + DEFAULT_MARGIN_BOTTOM);

@Component({
  selector: 'app-bar-plot',
  templateUrl: './bar-plot.component.html',
  styleUrls: ['./bar-plot.component.scss']
})
export class BarPlotComponent extends TwoAxisPlotComponent {

  private _dataGroupsCount: DataGroupsCount = [];

  @Input() plotTitle: string = '';
  @Input() showGroupNames = false;

  @Input('dataGroupsCount')
  set dataGroupsCount(value: DataGroupsCount) {
    if (!value || value.length === 0) {
      return;
    }
    const sum = value.map((row) => row[1]).reduce((acc, val) => acc + val);
    this.groupNamesMap = value.map((row) => row[0]);
    this._dataGroupsCount = value.map(
      (row, i) => [this.showGroupNames ? row[0] : `${i}`, (row[1] / sum) * 100]
    );
  };

  get dataGroupsCount() {
    return this._dataGroupsCount;
  }

  private scaleX: ScaleBand<string>;
  private scaleY: ScaleLinear<number, number>;

  private legendText: Selection<SVGTextElement, unknown, null, undefined>;
  private percentagesGroup: Selection<SVGGElement, unknown, null, undefined>;

  private groupNamesMap: string[] = [];

  constructor(componentEl: ElementRef) {
    super(componentEl, {
      MARGIN_TOP: DEFAULT_MARGIN_TOP,
      MARGIN_RIGHT: DEFAULT_MARGIN_RIGHT,
      MARGIN_BOTTOM: DEFAULT_MARGIN_BOTTOM,
      MARGIN_LEFT: DEFAULT_MARGIN_LEFT
    });

    this.isReady.then(() => {
      this.initPlot();
      this.initScales(this.dataGroupsCount);
      this.drawAxises(this.scaleX, this.scaleY);
      if (!this.showGroupNames) {
        this.axisX.selectAll('text').style('display', 'none');
      }
      this.plotRoot.on('mouseleave', this.onMouseLeave.bind(this));

      this.drawBars(this.dataGroupsCount.map((d) => [d[0], 0]), 0);
      this.initPercentages();
      this.drawPercentages(this.dataGroupsCount.map((d) => [d[0], 0]), 0);
      this.drawBars(this.dataGroupsCount, ANIMATION_DURATION);
      this.drawPercentages(this.dataGroupsCount, ANIMATION_DURATION);
      this.drawTitle();
      if (!this.showGroupNames) {
        this.initLegend();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    if (this.isInitialized && this.isInputDataValid(changes)) {
      this.drawBars(this.dataGroupsCount, ANIMATION_DURATION);
      this.drawPercentages(this.dataGroupsCount, ANIMATION_DURATION);
    }
  }

  protected isInputDataValid(changes: SimpleChanges) {
    return Array.isArray(changes.dataGroupsCount.currentValue) &&
      changes.dataGroupsCount.currentValue.length > 0;
  }

  private initScales(data: DataGroupsCount) {
    this.scaleX = scaleBand()
      .domain(data.map((d) => d[0]))
      .range([0, this.size.W * (WIDTH_OCCUPATION - ESTIMATED_AXIS_FRAQ)])
      .padding(0.2)

    const maxY = Math.max(...data.map((d) => d[1]));
    this.scaleY = scaleLinear()
      .domain([0, maxY + (maxY * 0.20)])
      .range([this.size.H * (HEIGHT_OCCUPATION), 0])
  }

  private drawBars(data: DataGroupsCount, duration = 0) {
    let rectSelection = this.chartRoot.selectAll<SVGRectElement, unknown>("rect")
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

  private initPercentages() {
    this.percentagesGroup = this.chartRoot.append('g');
  }

  private drawPercentages(data: DataGroupsCount, duration = 0) {
    let textSelection = this.percentagesGroup.selectAll<SVGTextElement, unknown>("text")
      .data(data, (d: DataGroupCount) => d[0]);

    textSelection.exit().remove();

    textSelection = textSelection
      .enter()
      .append("text")
      .merge(textSelection);

    (transition.call(textSelection) as Transition<SVGRectElement, DataGroupCount, null, undefined>)
      .selectAll(() => textSelection.nodes())
      .duration(duration)
      .delay((_, i) => i * 100)
      .attr("x", (d: DataGroupCount) => (this.scaleX(d[0]) as number) + (this.scaleX.bandwidth() / 2))
      .attr("y", this.getBarTextOrdinate.bind(this))
      .attr('lengthAdjust', 'spacingAndGlyphs')
      .attr('text-anchor', 'middle')
      .style('font-size', '85%')
      .text((d: DataGroupCount) => d[1].toFixed(2) + '%')
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
      .text(this.plotTitle);
  }

  private initLegend() {
    this.legendText = this.plotRoot
      .append('text')
      .attr('y', this.innerSize.H + this.axisXSize.height + (this.MARGIN_BOTTOM / 2))
      .style('font-size', '85%');
    this.showDefaultLegend();
  }

  private showDefaultLegend() {
    this.legendText
      .append('tspan')
      .attr('x', this.size.W / 2 + this.MARGIN_LEFT)
      .attr('text-anchor', 'middle')
      .style('font-style', 'italic')
      .text('Наведите на столбец, чтобы увидеть легенду');
  }

  private onMouseOver(data: DataGroupCount, selectedIndex: number, nodes: SVGRectElement[]) {
    const selectedNode = [...nodes].splice(selectedIndex, 1)[0];
    selectAll(nodes).attr('opacity', 0.2);
    select(selectedNode).attr('opacity', 0.8);

    const textNodes = Array.from((this.percentagesGroup.node() as SVGGElement).children);
    const selectedText = textNodes.splice(selectedIndex, 1)[0];
    selectAll(textNodes).attr('opacity', 0.2);
    select(selectedText).attr('opacity', 1);

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
        .merge(spansSelection as any)
        .attr('dy', (d, i) => i * 15)
        .attr('x', this.size.W / 2 + this.MARGIN_LEFT)
        .attr('text-anchor', 'middle')
        .style('font-style', 'normal')
        .text((d) => d);
    }
  }

  private onMouseLeave(data: DataGroupCount, selectedIndex: number, nodes: SVGRectElement[]) {
    this.chartRoot.selectAll('rect').attr('opacity', 0.8);
    selectAll(Array.from((this.percentagesGroup.node() as SVGGElement).children))
      .attr('opacity', 1);
    if (!this.showGroupNames) {
      this.legendText.selectAll('tspan').remove();
      this.showDefaultLegend();
    }
  }

  private getBarTextOrdinate(data: DataGroupCount) {
    const percentage = data[1];
    const barH = this.innerSize.H - this.scaleY(percentage);

    if (percentage > 15) {
      return this.innerSize.H - (barH / 2);
    }
    return this.innerSize.H - barH - (this.innerSize.H * 0.05);

  }
}
