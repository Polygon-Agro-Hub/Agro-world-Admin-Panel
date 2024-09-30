import { Routes } from '@angular/router';
import { LoginComponent } from './application/main-components/login/login.component';
import { SignupComponent } from './application/main-components/signup/signup.component';
import { ForgoPasswordComponent } from './application/main-components/forgo-password/forgo-password.component';
import { PlantcareComponent } from './application/plantcare/plantcare.component';
import { SteckholdersComponent } from './application/steckholders-section/steckholders/steckholders.component';
import { ReportComponent } from './application/report-section/report/report.component';
import { FieldofficersComponent } from './application/fieldofficers/fieldofficers.component';
import { MarketplaceComponent } from './application/marketplace/marketplace.component';
import { ManageContentComponent } from './application/plant-care-app/manage-content/manage-content.component';
import { OngoingCultivationComponent } from './application/plant-care-app/ongoing-cultivation/ongoing-cultivation.component';
import { ViewCropCalanderComponent } from './application/plant-care-app/view-crop-calander/view-crop-calander.component';
import { CreateNewsComponent } from './application/plant-care-app/create-news/create-news.component';
import { CreateCropCalenderComponent } from './application/plant-care-app/create-crop-calender/create-crop-calender.component';
import { AddBlockWordsComponent } from './application/plant-care-app/add-block-words/add-block-words.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { CreateMarketPriceComponent } from './application/plant-care-app/create-market-price/create-market-price.component';
import { ManageMarketPriceComponent } from './application/plant-care-app/manage-market-price/manage-market-price.component';
import { CreateCropCalenderAddDaysComponent } from './application/plant-care-app/create-crop-calender-add-days/create-crop-calender-add-days.component';
import { ViewPlantcareUsersComponent } from './application/steckholders-section/view-plantcare-users/view-plantcare-users.component';
import { EditPlantcareUsersComponent } from './application/steckholders-section/edit-plantcare-users/edit-plantcare-users.component';
import { AdminUsersComponent } from './application/steckholders-section/admin-users/admin-users.component';
import { CreateAdminUserComponent } from './application/steckholders-section/create-admin-user/create-admin-user.component';
import { AuthGuard } from './guards/auth-guard.service';
import { ViewCollectiveOfficerComponent } from './application/steckholders-section/view-collective-officer/view-collective-officer.component';
import { CollectionOfficerReportComponent } from './application/report-section/collection-officer-report/collection-officer-report.component';
import { CollectionOfficerReportViewComponent } from './application/collection-officer-app/collection-officer-report-view/collection-officer-report-view.component';
import { CollectiveofficersPersonalComponent } from './application/collection-officer-app/collectiveofficers-personal/collectiveofficers-personal.component';
import { CollectiveofficersCompanyComponent } from './application/collection-officer-app/collectiveofficers-company/collectiveofficers-company.component';
import { CollectiveofficersBankDetailsComponent } from './application/collection-officer-app/collectiveofficers-bank-details/collectiveofficers-bank-details.component';

import { CollectionofficerDistrictReportComponent } from './application/collectionofficer-district-report/collectionofficer-district-report.component';
import { EditAdminMeUserComponent } from './application/main-components/edit-admin-me-user/edit-admin-me-user.component';
import { ReportsFarmerListComponent } from './application/plant-care-app/reports-farmer-list/reports-farmer-list.component';
import { FixedAssetCategoryComponent } from './application/plant-care-app/fixed-asset-category/fixed-asset-category.component';
import { BuildingFixedAssetComponent } from './application/plant-care-app/building-fixed-asset/building-fixed-asset.component';
import { LandFixedAssetComponent } from './application/plant-care-app/land-fixed-asset/land-fixed-asset.component';
import { MachToolsFixeedAssetsComponent } from './application/plant-care-app/mach-tools-fixeed-assets/mach-tools-fixeed-assets.component';
import { ReportCurrentAssertsComponent } from './application/plant-care-app/report-current-asserts/report-current-asserts.component';
import { CurrentAssetsViewComponent } from './application/plant-care-app/current-assets-view/current-assets-view.component';
import { CurrentAssetRecordComponent } from './application/plant-care-app/current-asset-record/current-asset-record.component';
import { ViewCropTaskComponent } from './application/plant-care-app/view-crop-task/view-crop-task.component';
import { SlaveCropCalendarComponent } from './application/plant-care-app/slave-crop-calendar/slave-crop-calendar.component';
import { EditTaskComponent } from './application/plant-care-app/edit-task/edit-task.component';
import { PublicForumComponent } from './application/plant-care-app/public-forum/public-forum.component';
import { UserCropCalendarComponent } from './application/plant-care-app/user-crop-calendar/user-crop-calendar.component';
import { UserTaskEditComponent } from './application/plant-care-app/user-task-edit/user-task-edit.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'signup', component: SignupComponent, canActivate: [AuthGuard] },
      {
        path: 'forgot-password',
        component: ForgoPasswordComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'steckholders',
        component: SteckholdersComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care',
        component: PlantcareComponent,
        canActivate: [AuthGuard],
      },
      { path: 'reports', component: ReportComponent, canActivate: [AuthGuard] },
      {
        path: 'field-officer',
        component: FieldofficersComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'market-place',
        component: MarketplaceComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/manage-content',
        component: ManageContentComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/ongoing-cultivation',
        component: OngoingCultivationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/view-crop-calender',
        component: ViewCropCalanderComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/create-news',
        component: CreateNewsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/create-crop-calender',
        component: CreateCropCalenderComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/edit-crop-task/:id',
        component: EditTaskComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/create-crop-calender/add-days',
        component: CreateCropCalenderAddDaysComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/add-block-words',
        component: AddBlockWordsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/create-market-price',
        component: CreateMarketPriceComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/manage-market-price',
        component: ManageMarketPriceComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin-users',
        component: AdminUsersComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin-users/create-admin-user',
        component: CreateAdminUserComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/view-plantcare-users',
        component: ViewPlantcareUsersComponent,
      },
      {
        path: 'plant-care/edit-plantcare-users',
        component: EditPlantcareUsersComponent,
      },
      {
        path: 'collective-officer',
        component: ViewCollectiveOfficerComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'collective-officer-reort',
        component: CollectionOfficerReportComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'collective-officer/personal',
        component: CollectiveofficersPersonalComponent,
      },
      {
        path: 'collective-officer/company',
        component: CollectiveofficersCompanyComponent,
      },
      {
        path: 'collective-officer/bank-details',
        component: CollectiveofficersBankDetailsComponent,
      },
      {
        path: 'report/collective-officer-report/view/:id/:name',
        component: CollectionOfficerReportViewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'collective-officer/district-report',
        component: CollectionofficerDistrictReportComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin-users/edit-admin-me-user',
        component: EditAdminMeUserComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/report-farmer-list',
        component: ReportsFarmerListComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'assets/fixed-asset-category',
        component: FixedAssetCategoryComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'assets/fixed-asset-category/building-fixed-asset',
        component: BuildingFixedAssetComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'assets/fixed-asset-category/land-fixed-asset',
        component: LandFixedAssetComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'assets/fixed-asset-category/machinary&tools-fixed-asset',
        component: MachToolsFixeedAssetsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/current-assets-view',
        component: CurrentAssetsViewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/report-farmer-current-assert/:userId/:name',
        component: ReportCurrentAssertsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/report-farmer-current-assert/record-view',
        component: CurrentAssetRecordComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/view-crop-task/:cropId',
        component: ViewCropTaskComponent,
        // canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/view-crop-task-by-user',
        component: SlaveCropCalendarComponent,
        // canActivate: [AuthGuard],
      },

      {
        path: 'plant-care/public-forum',
        component: PublicForumComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'plant-care/view-crop-task-by-user/user-task-list/edit-user-task',
        component: UserTaskEditComponent,
        canActivate: [AuthGuard],
      },

      { path: '', redirectTo: '/steckholders', pathMatch: 'full' }, // Redirect to plant-care if no path
    ],
  },
];
