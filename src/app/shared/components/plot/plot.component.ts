import { AfterViewInit, ElementRef, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { select, Selection } from 'd3-selection';

export interface PlotConfiguration {
  MARGIN_TOP?: number;
  MARGIN_RIGHT?: number;
  MARGIN_BOTTOM?: number;
  MARGIN_LEFT?: number;
}

export interface Size { W: number, H: number };

export abstract class PlotComponent implements AfterViewInit, OnChanges {

  /**
   * Plot properties
   */
  @ViewChild('plot', { read: ElementRef, static: false })
  private plotEl: ElementRef;
  protected plotRoot: Selection<SVGGElement, unknown, null, undefined>;

  private _size: Size;
  protected get size() {
    if (!this._size) {
      this._size = {
        W: this.componentEl.nativeElement.clientWidth,
        H: this.componentEl.nativeElement.clientHeight
      };
    }
    return this._size;
  }

  private _innerSize?: Size;
  protected get innerSize() { // size inside margins. override if Y axis added
    if (!this._innerSize) {
      this._innerSize = {
        W: this.size.W - (this.MARGIN_LEFT + this.MARGIN_RIGHT),
        H: this.size.H - (this.MARGIN_TOP + this.MARGIN_BOTTOM)
      };
    }
    return this._innerSize;
  }


  /**
   * Initialization properties
   */
  protected isInitialized = false;
  protected isReady: Promise<any>;
  private dataIsReady: () => void;
  private viewIsReady: () => void;

  protected get MARGIN_TOP() {
    return this.getFraction(this.size.H, (this.config && this.config.MARGIN_TOP) || 0);
  }

  protected get MARGIN_RIGHT() {
    return this.getFraction(this.size.W, (this.config && this.config.MARGIN_RIGHT) || 0);
  }

  protected get MARGIN_BOTTOM() {
    return this.getFraction(this.size.H, (this.config && this.config.MARGIN_BOTTOM) || 0);
  }

  protected get MARGIN_LEFT() {
    return this.getFraction(this.size.W, (this.config && this.config.MARGIN_LEFT) || 0);
  }

  constructor(
    private componentEl: ElementRef,
    protected config?: PlotConfiguration
  ) {
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
    const { W, H } = this.size;
    this.plotRoot = select(this.plotEl.nativeElement)
      .attr('viewBox', `0 0 ${W} ${H}`);
  }

  private getFraction(whole: number, part: number) {
    return whole * part;
  }

}
