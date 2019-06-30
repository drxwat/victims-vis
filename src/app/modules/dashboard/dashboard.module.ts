import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VictimsDashboardComponent } from './components/victims-dashboard/victims-dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';


@NgModule({
  declarations: [VictimsDashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ],
  exports: [VictimsDashboardComponent]
})
export class DashboardModule { }
