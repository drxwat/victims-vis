import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { BarPlotComponent } from '@shared/components/bar-plot/bar-plot.component';
import { DensityPlotComponent } from '@shared/components/density-plot/density-plot.component';
import { VictimsDashboardComponent } from './components/victims-dashboard/victims-dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';


@NgModule({
  declarations: [
    VictimsDashboardComponent,
    DensityPlotComponent,
    BarPlotComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatGridListModule
  ],
  exports: [VictimsDashboardComponent]
})
export class DashboardModule { }
