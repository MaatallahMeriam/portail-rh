import { Component } from "@angular/core";
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbsenceRateComponent } from "./widgets/absence-rate/absence-rate.component"
import { OnsiteWorkComponent } from "./widgets/onsite-work/onsite-work.component"
import { BirthdayComponent } from "./widgets/birthday/birthday.component"
import { AgeGroupsComponent } from "./widgets/age-groups/age-groups.component"
import { TurnoverComponent } from "./widgets/turnover/turnover.component"
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';

@Component({
  selector: 'app-kpi-admin',
  standalone: true,
  imports: [HeaderComponent,AbsenceRateComponent,SidebarAdminComponent,
    OnsiteWorkComponent,
    BirthdayComponent,
    AgeGroupsComponent,
    TurnoverComponent],
  templateUrl: './kpi-admin.component.html',
  styleUrl: './kpi-admin.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})

export class KPIComponentAdmin {}

