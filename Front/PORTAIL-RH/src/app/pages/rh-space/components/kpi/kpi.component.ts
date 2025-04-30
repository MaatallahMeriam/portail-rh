import { Component } from "@angular/core";
import { SidebarComponent } from "../sidebar-RH/sidebar.component";
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbsenceRateComponent } from "./widgets/absence-rate/absence-rate.component"
import { OnsiteWorkComponent } from "./widgets/onsite-work/onsite-work.component"
import { BirthdayComponent } from "./widgets/birthday/birthday.component"
import { AgeGroupsComponent } from "./widgets/age-groups/age-groups.component"
import { TurnoverComponent } from "./widgets/turnover/turnover.component"
@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [HeaderComponent, AbsenceRateComponent,
    OnsiteWorkComponent,
    BirthdayComponent,
    AgeGroupsComponent,
    TurnoverComponent, SidebarComponent],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class KPIComponent {}