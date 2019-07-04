import { AfterViewInit, ElementRef, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { select, Selection } from 'd3-selection';

export abstract class PlotComponent implements AfterViewInit, OnChanges {

  /**
   * Plot properties
   */
  @ViewChild('plot', { read: ElementRef, static: false })
  protected plotEl: ElementRef;
  protected plotRoot: Selection<SVGGElement, unknown, null, undefined>;

  protected size: { W: number, H: number };

  /**
   * Initialization properties
   */
  protected isInitialized = false;
  protected isReady: Promise<any>;
  private dataIsReady: () => void;
  private viewIsReady: () => void;

  constructor(private componentEl: ElementRef, private margin = 0) {
    this.isReady = Promise.all([
      new Promise((res) => { this.dataIsReady = res }),
      new Promise((res) => { this.viewIsReady = res })
    ]).then(() => this.isInitialized = true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isInputDataValid(changes)) {
      this.dataIsReady();
    }
  }

  ngAfterViewInit() {
    this.viewIsReady();
  }

  protected abstract isInputDataValid(changes: SimpleChanges): boolean;

  /**
   * Sets correct viewBox & root grouping element
   */
  protected initPlot() {
    const { W, H } = this.getSize();
    this.plotRoot = select(this.plotEl.nativeElement)
      .attr('viewBox', `0 0 ${W + this.margin} ${H + this.margin}`)
      .append('g')
      .attr('transform', `translate(${this.margin}, 0)`);
  }

  /**
   * Gets host component size
   */
  protected getSize() {
    if (!this.size) {
      this.size = {
        W: this.componentEl.nativeElement.clientWidth,
        H: this.componentEl.nativeElement.clientHeight
      };
    }
    return this.size;
  }
}
