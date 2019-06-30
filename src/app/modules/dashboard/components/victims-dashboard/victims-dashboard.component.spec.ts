import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VictimsDashboardComponent } from './victims-dashboard.component';

describe('VictimsDashboardComponent', () => {
  let component: VictimsDashboardComponent;
  let fixture: ComponentFixture<VictimsDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VictimsDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VictimsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
