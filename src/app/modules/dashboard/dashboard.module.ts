import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { BarPlotComponent } from '@shared/components/bar-plot/bar-plot.component';
import { DensityPlotComponent } from '@shared/components/density-plot/density-plot.component';
import { SingleBarPlotComponent } from '@shared/components/single-bar-plot/single-bar-plot.component';
import { VictimsDashboardComponent } from './components/victims-dashboard/victims-dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';


@NgModule({
  declarations: [
    VictimsDashboardComponent,
    DensityPlotComponent,
    BarPlotComponent,
    SingleBarPlotComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatGridListModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  exports: [VictimsDashboardComponent]
})
export class DashboardModule { }
