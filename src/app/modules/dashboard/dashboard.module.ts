import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DensityPlotComponent } from '@shared/components/density-plot/density-plot.component';
import { VictimsDashboardComponent } from './components/victims-dashboard/victims-dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';


@NgModule({
  declarations: [
    VictimsDashboardComponent,
    DensityPlotComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ],
  exports: [VictimsDashboardComponent]
})
export class DashboardModule { }
