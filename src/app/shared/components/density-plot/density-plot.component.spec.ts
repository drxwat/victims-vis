import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DensityPlotComponent } from './density-plot.component';

describe('DensityPlotComponent', () => {
  let component: DensityPlotComponent;
  let fixture: ComponentFixture<DensityPlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DensityPlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DensityPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
