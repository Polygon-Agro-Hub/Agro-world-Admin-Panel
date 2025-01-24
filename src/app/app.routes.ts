import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard.service';
import { LoginComponent } from './application/main-components/login/login.component';
import { SignupComponent } from './application/main-components/signup/signup.component';
import { ForgoPasswordComponent } from './application/main-components/forgo-password/forgo-password.component';
import { PlantcareComponent } from './application/plant-care-app/plantcare/plantcare.component';
import { SteckholdersComponent } from './application/steckholders-section/steckholders/steckholders.component';
import { ReportComponent } from './application/report-section/report/report.component';
import { FieldofficersComponent } from './application/fieldofficers/fieldofficers.component';
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
import { ViewCollectiveOfficerComponent } from './application/steckholders-section/view-collective-officer/view-collective-officer.component';
import { CollectionOfficerReportComponent } from './application/report-section/collection-officer-report/collection-officer-report.component';
import { CollectionOfficerReportViewComponent } from './application/collection-officer-app/collection-officer-report-view/collection-officer-report-view.component';
import { CollectiveofficersPersonalComponent } from './application/collection-officer-app/collectiveofficers-personal/collectiveofficers-personal.component';
import { CollectiveofficersCompanyComponent } from './application/collection-officer-app/collectiveofficers-company/collectiveofficers-company.component';
import { CollectiveofficersBankDetailsComponent } from './application/collection-officer-app/collectiveofficers-bank-details/collectiveofficers-bank-details.component';
import { CollectionofficerDistrictReportComponent } from './application/report-section/collectionofficer-district-report/collectionofficer-district-report.component';
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
import { AddNewCropCalanderTaskComponent } from './application/plant-care-app/add-new-crop-calander-task/add-new-crop-calander-task.component';
import { ViewUserProfileComponent } from './application/steckholders-section/view-user-profile/view-user-profile.component';
import { CollectionAllViewComponent } from './application/collection-hub-section/collection-all-view/collection-all-view.component';
import { ViewCurrentMarketPriceComponent } from './application/collection-hub-section/view-current-market-price/view-current-market-price.component';
import { MarketPriceBulkDeleteComponent } from './application/collection-hub-section/market-price-bulk-delete/market-price-bulk-delete.component';
import { MarketPriceBulkUploadComponent } from './application/collection-hub-section/market-price-bulk-upload/market-price-bulk-upload.component';
import { CollectionHubComponent } from './application/collection-hub-section/collection-hub/collection-hub.component';
import { ViewComplainComponent } from './application/collection-hub-section/view-complain/view-complain.component';
import { ViewSelectedComplainComponent } from './application/collection-hub-section/view-selected-complain/view-selected-complain.component';
import { PaymentSlipReportComponent } from './application/report-section/payment-slip-report/payment-slip-report.component';
import { AddCollectionCenterComponent } from './application/collection-hub-section/add-collection-center/add-collection-center.component';
import { FarmerListReportComponent } from './application/report-section/farmer-list-report/farmer-list-report.component';
import { CollectionOfficerProvinceReportComponent } from './application/report-section/collection-officer-province-report/collection-officer-province-report.component';
import { MarketPlaceDashbordComponent } from './application/marketplace/market-place-dashbord/dashbord/market-place-dashbord.component';
import { MarketPlaceActionsComponent } from './application/marketplace/market-place-actions/market-place-actions.component';
import { CreateCropGroupComponent } from './application/plant-care-app/create-crop-group/create-crop-group.component';
import { ViewCropGroupComponent } from './application/plant-care-app/view-crop-group/view-crop-group.component';
import { MarketAddProductComponent } from './application/marketplace/market-add-product/market-add-product.component';
import { ViewProductsListComponent } from './application/marketplace/view-products-list/view-products-list.component';
import { CreateVarietyComponent } from './application/plant-care-app/create-variety/create-variety.component';
import { ViewVarietyComponent } from './application/plant-care-app/view-variety/view-variety.component';
import { AddCoupenComponent } from './application/marketplace/add-coupen/add-coupen.component';
import { UserBulkUploadComponent } from './application/steckholders-section/user-bulk-upload/user-bulk-upload.component';
import { ViewCoupenComponent } from './application/marketplace/view-coupen/view-coupen.component';
import { EditCollectionCenterComponent } from './application/collection-hub-section/edit-collection-center/edit-collection-center.component';
import { AddPackageComponent } from './application/marketplace/add-package/add-package.component';
import { MonthlyReportComponent } from './application/report-section/monthly-report/monthly-report.component';
import { CreateCompanyComponent } from './application/collection-hub-section/create-company/create-company.component';
import { ManageCompanyComponent } from './application/collection-hub-section/manage-company/manage-company.component';
import { CollectiveofficersEditComponent } from './application/collection-officer-app/collectiveofficers-edit/collectiveofficers-edit.component';
import { SalesDashComponent } from './application/sales-dash-section/sales-dash/sales-dash.component';
import { ComplaintsDashbordComponent } from './application/Complaints/complaints-dashbord/complaints-dashbord.component';
import { OptOutFeedbacksComponent } from './application/plant-care-app/opt-out-feedbacks/opt-out-feedbacks.component';
import { CreateFeedbackComponent } from './application/plant-care-app/create-feedback/create-feedback.component';
import { CollectionCenterViewComplainComponent } from './application/collection-hub-section/collection-center-view-complain/collection-center-view-complain.component';
import { SalesTargetComponent } from './application/sales-dash-section/sales-target/sales-target.component';

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
      {
        path: 'admin-users/edit-admin-me-user',
        component: EditAdminMeUserComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'plant-care',
        children: [
          {
            path: '',
            component: PlantcareComponent,
          },
          {
            path: 'create-news',
            component: CreateNewsComponent,
          },
          {
            path: 'manage-content',
            component: ManageContentComponent,
          },
          {
            path: 'create-market-price',
            component: CreateMarketPriceComponent,
          },
          {
            path: 'manage-market-price',
            component: ManageMarketPriceComponent,
          },
          {
            path: 'create-crop-calender',
            component: CreateCropCalenderComponent,
          },
          {
            path: 'view-crop-calender',
            component: ViewCropCalanderComponent,
          },
          {
            path: 'view-crop-task/:cropId',
            component: ViewCropTaskComponent,
          },
          {
            path: 'edit-crop-task/:id',
            component: EditTaskComponent,
          },
          {
            path: 'public-forum',
            component: PublicForumComponent,
          },
          {
            path: 'ongoing-cultivation',
            component: OngoingCultivationComponent,
          },
          {
            path: 'view-crop-task-by-user',
            component: SlaveCropCalendarComponent,
          },
          {
            path: 'view-crop-task-by-user/user-task-list/edit-user-task',
            component: UserTaskEditComponent,
          },
          {
            path: 'view-crop-task-by-user/user-task-list',
            component: UserCropCalendarComponent,
          },
          {
            path: 'report-farmer-list',
            component: ReportsFarmerListComponent,
          },
          {
            path: 'report-farmer-current-assert/:userId/:name',
            component: ReportCurrentAssertsComponent,
          },
          {
            path: 'current-assets-view',
            component: CurrentAssetsViewComponent,
          },
          {
            path: 'report-farmer-current-assert/record-view',
            component: CurrentAssetRecordComponent,
          },
          {
            path: 'assets/fixed-asset-category',
            component: FixedAssetCategoryComponent,
          },
          {
            path: 'assets/fixed-asset-category/building-fixed-asset',
            component: BuildingFixedAssetComponent,
          },
          {
            path: 'assets/fixed-asset-category/land-fixed-asset',
            component: LandFixedAssetComponent,
          },
          {
            path: 'assets/fixed-asset-category/machinary&tools-fixed-asset',
            component: MachToolsFixeedAssetsComponent,
          },
          {
            path: 'add-new-crop-task/:cropId/:indexId/:userId/:onCulscropID ',
            component: AddNewCropCalanderTaskComponent,
          },
          {
            path: 'add-block-words',
            component: AddBlockWordsComponent,
          },
          {
            path: 'create-crop-group',
            component: CreateCropGroupComponent,
          },
          {
            path: 'view-crop-group',
            component: ViewCropGroupComponent,
          },
          {
            path: 'create-crop-variety',
            component: CreateVarietyComponent,
          },
          {
            path: 'view-crop-variety',
            component: ViewVarietyComponent,
          },
          {
            path: 'opt-out-feedbacks',
            children: [
              {
                path: '',
                component: OptOutFeedbacksComponent,
              },
              {
                path: 'create-feedback',
                component: CreateFeedbackComponent,
              },
            ],
          },
        ],
      },

      {
        path: 'reports',
        children: [
          {
            path: '',
            component: ReportComponent,
          },
          {
            path: 'collective-officer-report',
            component: CollectionOfficerReportComponent,
          },
          {
            path: 'collective-officer-report/view/:id/:name',
            component: CollectionOfficerReportViewComponent,
          },
          {
            path: 'collective-officer/district-report',
            component: CollectionofficerDistrictReportComponent,
          },
          {
            path: 'payment-slip-report/:id',
            component: PaymentSlipReportComponent,
          },
          {
            path: 'farmer-list-report',
            component: FarmerListReportComponent,
          },
          {
            path: 'collective-officer/province-report',
            component: CollectionOfficerProvinceReportComponent,
          },
          {
            path: 'collective-officer-report/monthly-report/:id',
            component: MonthlyReportComponent,
          },
        ],
      },

      {
        path: 'steckholders',
        children: [
          {
            path: '',
            component: SteckholdersComponent,
          },
          {
            path: 'farmers',
            children: [
              {
                path: '',
                component: ViewPlantcareUsersComponent,
              },
              {
                path: 'edit-plantcare-users',
                component: EditPlantcareUsersComponent,
              },
              {
                path: 'upload-farmers',
                component: UserBulkUploadComponent,
              },
            ],
          },

          {
            path: 'admin',
            children: [
              {
                path: '',
                component: AdminUsersComponent,
              },
              {
                path: 'create-admin-user',
                component: CreateAdminUserComponent,
                canActivate: [AuthGuard],
              },
            ],
          },

          {
            path: 'collective-officer',
            children: [
              {
                path: '',
                component: ViewCollectiveOfficerComponent,
              },
              {
                path: 'personal',
                component: CollectiveofficersPersonalComponent,
              },
              {
                path: 'personal-edit/:id',
                component: CollectiveofficersEditComponent,
              },
              {
                path: 'company',
                component: CollectiveofficersCompanyComponent,
              },
              {
                path: 'bank-details',
                component: CollectiveofficersBankDetailsComponent,
              },
            ],
          },
        ],
      },

      {
        path: 'field-officer',
        children: [
          {
            path: '',
            component: FieldofficersComponent,
          },
        ],
      },

      {
        path: 'market-place',
        children: [
          {
            path: '',
            component: MarketPlaceDashbordComponent,
          },
          {
            path: 'view-current-price',
            component: ViewCurrentMarketPriceComponent,
          },
          {
            path: 'delete-bulk-price',
            component: MarketPriceBulkDeleteComponent,
          },
          {
            path: 'price-bulk-upload',
            component: MarketPriceBulkUploadComponent,
          },
        ],
      },

      {
        path: 'collection-hub',
        children: [
          { path: '', component: CollectionHubComponent },
          {
            path: 'view-collection-centers',
            component: CollectionAllViewComponent,
          },
          {
            path: 'view-selected-complain/:id/:farmerName',
            component: ViewSelectedComplainComponent,
          },
          {
            path: 'update-collection-center/:id',
            component: EditCollectionCenterComponent,
          },
          {
            path: 'create-company',
            component: CreateCompanyComponent,
          },
          {
            path: 'manage-company',
            component: ManageCompanyComponent,
          },
          {
            path: 'view-collection-centers',
            component: CollectionAllViewComponent,
          },
          {
            path: 'add-collection-center',
            component: AddCollectionCenterComponent,
          },
        ],
      },

      {
        path: 'market',
        children: [
          {
            path: '',
            component: MarketPlaceDashbordComponent,
          },
          {
            path: 'action',
            component: MarketPlaceActionsComponent,
          },
          {
            path: 'add-product',
            component: MarketAddProductComponent,
          },
          {
            path: 'view-products-list',
            component: ViewProductsListComponent,
          },
          {
            path: 'add-coupen',
            component: AddCoupenComponent,
          },
          {
            path: 'view-coupen',
            component: ViewCoupenComponent,
          },
          {
            path: 'add-package',
            component: AddPackageComponent,
          },
        ],
      },
      {
        path: 'sales-dash',
        children: [
          {
            path: '',
            component: SalesDashComponent,
          },
          {
            path: 'sales-targets',
            component: SalesTargetComponent,
          },
        ],
      },
      {
        path: 'complaints',
        children: [
          {
            path: '',
            component: ComplaintsDashbordComponent,
          },
          {
            path: 'view-complains',
            component: ViewComplainComponent,
          },
          {
            path: 'collection-center-complains',
            component: CollectionCenterViewComplainComponent,
          },
        ],
      },

      { path: '', redirectTo: '/steckholders', pathMatch: 'full' },
    ],
  },
];
