import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleBarPlotComponent } from './single-bar-plot.component';

describe('SingleBarPlotComponent', () => {
  let component: SingleBarPlotComponent;
  let fixture: ComponentFixture<SingleBarPlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleBarPlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleBarPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
