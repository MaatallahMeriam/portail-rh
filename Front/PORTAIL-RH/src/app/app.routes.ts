import { Routes } from '@angular/router';
import { DetailsUserAdminComponent } from './pages/admin-space/component/details-user-admin/details-user-admin.component';
import { GestionProfileAdminComponent } from './pages/admin-space/component/gestion-profile-admin/gestion-profile-admin.component';
import { DetailsIdeeComponent } from './pages/collab-space/components/details-idee/details-idee.component';
import { DetailsIdeeComponentRH } from './pages/rh-space/components/details-idee-rh/details-idee.component';
import { DetailsIdeeManagerComponent } from './pages/manager-space/components/details-idee-manager/details-idee-manager.component';
import { WishListComponent } from './pages/collab-space/components/wish-list/wish-list.component';
import { QrPointageComponent } from './shared/components/qr-pointage/qr-pointage.component';
import { PointageCollabComponent } from './pages/collab-space/components/pointage-collab/pointage-collab.component';
import { PointageManagerComponent } from './pages/manager-space/components/pointage-manager/pointage-manager.component';
import { DetailsEquipeComponent } from './pages/rh-space/components/details-equipe/details-equipe.component';
import { LoginComponent } from './shared/components/login/login.component';
import { CollabSpaceComponent } from './pages/collab-space/collab-space.component';  
import {DmdDocCollab} from './pages/collab-space/components/dmd-doc-collab/dmd-doc.component';
import {DmdLogCollabComponent} from './pages/collab-space/components/dmd-log-collab/dmd-log-collab.component'
import {DmdCongesComponent} from'./pages/collab-space/components/dmd-conges-collab/dmd-conges.component';
import {RhSpaceComponent} from './pages/rh-space/rh-space.component';
import {DmdCongesComponentRH} from'./pages/rh-space/components/dmd-conges-RH/dmd-conges.component';
import {ParametrageRhComponent} from './pages/rh-space/components/parametrage-rh/parametrage-rh.component';
import {GestionDocComponent} from './pages/rh-space/components/gestion-document/gestion-document';
import {ManagerSpaceComponent} from './pages/manager-space/manager-space.component';
import {AdminSpaceComponent} from './pages/admin-space/admin-space.component';
import {SoldeCongesComponent} from './pages/rh-space/components/solde-conges/solde-conges.component';
import {GestionNewsComponent}from './pages/rh-space/components/gestion-news/gestion-news.component'
import{AcceuilComponent} from './shared/components/acceuil/acceuil.component'
import { RegisterComponent } from './shared/components/register/register.component';
import {GestionDossierComponent} from './pages/rh-space/components/gestion-dossier/gestion-dossier.component'
import { KPIComponent } from './pages/rh-space/components/kpi/kpi.component';
import { GestionCongesComponent } from './pages/rh-space/components/conges-user/gestion-conges.component';
import { DetailsDossierComponent } from './pages/rh-space/components/details-dossier/details-dossier.component';
import { ArchiveListComponent } from './pages/admin-space/component/archive-list/archive-list.component';
import { DmdUserComponent } from './pages/rh-space/components/dmd-user/dmd-user.component';
import { ActifListComponent } from './pages/admin-space/component/actif-list/actif-list.component';
import { ListMemberManagerComponent } from './pages/manager-space/components/list-member-manager/list-member-manager.component';
import { DossierUserAdminComponent } from './pages/admin-space/component/dossier-user-admin/dossier-user-admin.component';
import { InfoUserAdminComponent } from './pages/admin-space/component/info-user-admin/info-user-admin.component';
import { PlanningTtComponent } from './pages/rh-space/components/planning-tt/planning-tt.component';
import { PlanningUserComponent } from './pages/collab-space/components/planning-user/planning-user.component';
import { ListPlanningsComponent } from './pages/rh-space/components/list-plannings/list-plannings.component';
import { DetailsMembreEqComponent } from './pages/manager-space/components/details-membre-eq/details-membre-eq.component';
import { GestionProfileComponent } from './pages/collab-space/components/gestion-profile/gestion-profile.component';
import { ProfilManagerComponent } from './pages/manager-space/components/profil-manager/profil-manager.component';
import { ListMemberCollabComponent } from './pages/collab-space/components/list-member-collab/list-member-collab.component';
import { ListMemberRhComponent } from './pages/rh-space/components/list-member-rh/list-member-rh.component';
import { EspaceDocCollabComponent } from './pages/collab-space/components/espace-doc-collab/espace-doc-collab.component';
import { IdeeCollabComponent } from './pages/collab-space/components/idee-collab/idee-collab.component';
import { EquipeAdminComponent } from './pages/admin-space/component/equipe-admin/equipe-admin.component';

import { EspaceDocManagerComponent } from './pages/manager-space/components/espace-doc-manager/espace-doc-manager.component';
import { IdeeManagerComponent } from './pages/manager-space/components/idee-manager/idee-manager.component';
import { IdeeRhComponent } from './pages/rh-space/components/idee-rh/idee-rh.component';

import { ProfilRhComponent } from './pages/rh-space/components/profil-rh/profil-rh.component';

import { DossierUserComponent } from './pages/rh-space/components/dossier-user/dossier-user.component';
import { InfosUserComponent } from './pages/rh-space/components/infos-user/infos-user.component';
import { KPIComponentAdmin } from './pages/admin-space/component/kpi-admin/kpi-admin.component';
import { ParametrageAdminComponent } from './pages/admin-space/component/parametrage-admin/parametrage-admin.component';
import { NewsAdminComponent } from './pages/admin-space/component/news-admin/news-admin.component';
import { DocAdminComponent } from './pages/admin-space/component/doc-admin/doc-admin.component';
import { ListEquipesComponent } from './pages/rh-space/components/list-equipes/list-equipes.component';
import { AuthGuard } from './@core/guards/auth.guard';
import { DmdDocManagerComponent } from './pages/manager-space/components/dmd-doc-manager/dmd-doc-manager.component';
import { DmdLogManagerComponent } from './pages/manager-space/components/dmd-log-manager/dmd-log-manager.component';
import { DmdCongesManagerComponent } from './pages/manager-space/components/dmd-conges-manager/dmd-conges-manager.component';
import { TraitDmdComponent } from './pages/manager-space/components/trait-dmd/trait-dmd.component';
import { HistoDmdCongesComponent } from './pages/rh-space/components/histo-dmd-conges/histo-dmd-conges.component';
import { TraitDmdDetailsComponent } from './pages/rh-space/components/trait-dmd-details/trait-dmd-details.component';
import { PlanningManagerComponent } from './pages/manager-space/components/planning-manager/planning-manager.component';
import { GestionProjetComponent } from './pages/rh-space/components/gestion-projet/gestion-projet.component';
import { DetailsProjetComponent } from './pages/rh-space/components/details-projet/details-projet.component';
import { ProjetCollabComponent } from './pages/collab-space/components/projet-collab/projet-collab.component';
import { DetailsProjetCollabComponent } from './pages/collab-space/components/details-projet-collab/details-projet-collab.component';
import { GestProjManagerComponent } from './pages/manager-space/components/gest-proj-manager/gest-proj-manager.component';
import { DetailsPrjManagerComponent } from './pages/manager-space/components/details-prj-manager/details-prj-manager.component';

export const routes: Routes = [
  {path:'projet-collab',component:ProjetCollabComponent},
  {path:'pointage-collab',component: PointageCollabComponent},
  {path:'pointage-manager',component: PointageManagerComponent},
    {path:'projet-rh',component: GestionProjetComponent},
{path:'details-projet',component:DetailsProjetComponent},
{path:'details-projet-collab', component:DetailsProjetCollabComponent},
  {path:'gest-proj-manager', component:GestProjManagerComponent},
  {path:'details-prj-manager', component:DetailsPrjManagerComponent },

    {path:'profil-rh',component:ProfilRhComponent},
    {path:'profil-manager',component:ProfilManagerComponent},
    {path:'membre-rh',component:ListMemberRhComponent},
    {path : 'membre-collab',component:ListMemberCollabComponent},
    {path:'doc-collab',component:EspaceDocCollabComponent},
    {path:'doc-manager',component:EspaceDocManagerComponent},
    {path:'idee-collab',component:IdeeCollabComponent},
    {path:'profil-admin',component:GestionProfileAdminComponent},
    { path: 'details-idee-collab/:id', component: DetailsIdeeComponent },
    {path:'idee-rh',component:IdeeRhComponent},
    {path:'idee-manager',component:IdeeManagerComponent},
  {path:'planning-manager',component:PlanningManagerComponent},
  {path:'histo-dmd',component:HistoDmdCongesComponent},
  {path:'valide-dmd',component:TraitDmdDetailsComponent},
  {path:'archive-list',component:ArchiveListComponent},
  {path:'dmd-user-list',component: DmdUserComponent},
  {path:'actif-list',component:ActifListComponent},
  {path:'details-eq',component:ListMemberManagerComponent},
  {path:'details-user-admin/:id',component:DetailsUserAdminComponent},
  {path:'dossier-user-admin',component:DossierUserAdminComponent},
  {path:'info-user-admin',component:InfoUserAdminComponent},
  {path:'planning-rh',component:PlanningTtComponent},
  {path : 'planning-user', component:PlanningUserComponent},
  {path:'list-plannings', component:ListPlanningsComponent},
  {path:'membre-equipe',component:DetailsMembreEqComponent},
  {path:'profile-collab',component:GestionProfileComponent},
  { path: 'details-idee-manager/:id', component: DetailsIdeeManagerComponent },
  {path : 'wishes-list',component :WishListComponent},

  {path:'trait-dmd',component:TraitDmdComponent},

  {path:'dmd-doc-manager',component:DmdDocManagerComponent},
  {path:'dmd-conges-manager',component:DmdCongesManagerComponent},
  {path:'dmd-log-manager',component:DmdLogManagerComponent},
  
  { path:'news-admin', component:NewsAdminComponent},
  {path:'doc-admin',component:DocAdminComponent},
{path:'details-equipe/:id', component:DetailsEquipeComponent},
    {path:'details-conges' , component:GestionCongesComponent},
    { path: 'acceuil', component: AcceuilComponent },
    {path:'details-dossier/:id',component:DetailsDossierComponent},
    {path:'dossier-user',component:DossierUserComponent},
  {path :'info-user', component: InfosUserComponent},
  { path : 'kpi-admin',component:KPIComponentAdmin},
  {path:'param-admin',component:ParametrageAdminComponent},

    { path: 'login', component: LoginComponent },  
    {path:'register', component: RegisterComponent},
    { path: 'collab-space', component: CollabSpaceComponent },
    {path :'demandeDocCollab', component: DmdDocCollab,canActivate: [AuthGuard]},
    {path :'demandeLogCollab', component: DmdLogCollabComponent,canActivate: [AuthGuard]},
    {path :'demandeCongCollab', component: DmdCongesComponent},
    {path :'demandeCongRH', component: DmdCongesComponentRH},
    {path :'rh-space', component: RhSpaceComponent},
    {path :'manager-space', component: ManagerSpaceComponent},
    {path :'admin-space', component: AdminSpaceComponent},
    {path :'parametrage-rh', component: ParametrageRhComponent},
    {path :'gestion-doc', component: GestionDocComponent},
    {path :'sold-list', component: SoldeCongesComponent},
    {path :'news-list', component: GestionNewsComponent},
    {path :'list-equipe', component: ListEquipesComponent},
    {path :'gestion-doss' , component: GestionDossierComponent},
    {path : 'kpi-rh', component: KPIComponent},
    { path: 'details-idee-rh/:id', component: DetailsIdeeComponentRH },
      {path:'eq-admin',component:EquipeAdminComponent},

    

    

  

];
