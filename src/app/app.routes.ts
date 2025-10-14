import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard.service';
import { LoginComponent } from './application/main-components/login/login.component';
import { SignupComponent } from './application/main-components/signup/signup.component';
import { ForgotPasswordComponent } from './application/main-components/forgot-password/forgot-password.component';
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
import { RoleSelectionComponent } from './application/settings-section/role-selection/role-selection.component';
import { PermissionAreaComponent } from './application/settings-section/permission-area/permission-area.component';
import { PlatCareDashbordComponent } from './application/plant-care-app/plant-care-dashbord/dashbord/plat-care-dashbord.component';
import { DashboardMainComponent } from './application/steckholders-section/stackholder-dashboard/dashboard-main/dashboard-main.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ManageApplicationsComponent } from './application/Complaints/manage-applications/manage-applications.component';
import { AddComplainCategoriesComponent } from './application/Complaints/add-complain-categories/add-complain-categories.component';
import { ManageComplaintsCategoriesComponent } from './application/Complaints/manage-complaints-categories/manage-complaints-categories.component';
import { EditComplainCagegoriesComponent } from './application/Complaints/edit-complain-cagegories/edit-complain-cagegories.component';
import { CollectionCenterDashboardComponent } from './application/collection-hub-section/collection-center-dashboard/collection-center-dashboard.component';
import { AddDailyTargetComponent } from './application/collection-hub-section/add-daily-target/add-daily-target.component';
import { MarketEditProductComponent } from './application/marketplace/market-edit-product/market-edit-product.component';
import { CustomersComponent } from './application/sales-dash-section/customers/customers.component';
import { ViewCollectiveOfficerProfileComponent } from './application/steckholders-section/view-collective-officer-profile/view-collective-officer-profile.component';
import { PermissionGuard } from './guards/permission.guard';
import { Status451Component } from './components/status-451/status-451.component';
import { ViewOfficerTargetComponent } from './application/steckholders-section/view-officer-target/view-officer-target.component';
import { ViewCompanyHeadComponent } from './application/collection-hub-section/view-company-head/view-company-head/view-company-head.component';
import { CreateCenterHeadComponent } from './application/collection-hub-section/create-center-head/create-center-head/create-center-head.component';
import { EditCenterHeadComponent } from './application/collection-hub-section/edit-center-head/edit-center-head/edit-center-head.component';
import { ViewCenterComplainComponent } from './application/Complaints/view-center-complain/view-center-complain.component';
import { ViewSalesAgentsComponent } from './application/collection-hub-section/view-sales-agents/view-sales-agents.component';
import { CreateSalesAgentsComponent } from './application/sales-dash-section/create-sales-agents/create-sales-agents.component';
import { EditSalesAgentComponent } from './application/sales-dash-section/edit-sales-agent/edit-sales-agent.component';
import { AgroWorldCentersComponent } from './application/collection-hub-section/agro-world-centers/agro-world-centers.component';
import { ViewCenterPriceComponent } from './application/collection-hub-section/view-center-price/view-center-price.component';
import { PreviewSalesAgentsComponent } from './application/sales-dash-section/preview-sales-agents/preview-sales-agents.component';
import { PreviewCollectionCenterComponent } from './application/collection-hub-section/preview-collection-center/preview-collection-center.component';
import { ViewOrdersComponent } from './application/sales-dash-section/view-orders/view-orders.component';
import { ViewSalesDashComplaintsComponent } from './application/sales-dash-section/view-sales-dash-complaints/view-sales-dash-complaints.component';
import { ViewSelectedSalesDashComplainComponent } from './application/sales-dash-section/view-selected-sales-dash-complain/view-selected-sales-dash-complain.component';
import { PurchaseReportComponent } from './application/report-section/purchase-report/purchase-report.component';
import { ViewPackageListComponent } from './application/marketplace/view-package-list/view-package-list.component';
import { MarketEditPackagesComponent } from './application/marketplace/market-edit-packages/market-edit-packages.component';
import { ViewPackageDetailsComponent } from './application/marketplace/view-package-details/view-package-details.component';
import { CollectionReportComponent } from './application/report-section/collection-report/collection-report.component';
import { ProcurementComponent } from './application/procurement-section/procurement/procurement.component';
import { DispatchComponent } from './application/dispatch-section/dispatch/dispatch.component';
import { RecievedOrdersComponent } from './application/procurement-section/recieved-orders/recieved-orders.component';
import { SalesdashOrdersComponent } from './application/dispatch-section/salesdash-orders/salesdash-orders.component';
import { BannerListComponent } from './application/marketplace/banner-list/banner-list.component';
import { DistributionHubDashboardComponent } from './application/distribution-hub/distribution-hub-dashboard/distribution-hub-dashboard.component';
import { DistributionhubComponent } from './application/distribution-hub/distributionhub/distributionhub.component';
import { ViewProductTypesComponent } from './application/marketplace/view-product-types/view-product-types.component';
import { AddDestributionCenterComponent } from './application/marketplace/add-destribution-center/add-destribution-center.component';
import { AddProductTypesComponent } from './application/marketplace/add-product-types/add-product-types.component';
import { ViewDistributionCenterComponent } from './application/distribution-hub/view-distribution-center/view-distribution-center.component';
import { ViewCompaniesComponent } from './application/distribution-hub/view-companies/view-companies.component';
import { SubsriptionComponent } from './application/marketplace/subsription/subsription.component';
import { DistributionViewCompanyComponent } from './application/distribution-hub/distribution-view-company/distribution-view-company.component';
import { AddDistributionOfficerComponent } from './application/distribution-hub/add-distribution-officer/add-distribution-officer.component';
import { EditProductTypesComponent } from './application/marketplace/edit-product-types/edit-product-types.component';
import { ViewRetailOrdersComponent } from './application/marketplace/view-retail-orders/view-retail-orders.component';
import { ViewDeliveryChargesComponent } from './application/marketplace/view-delivery-charges/view-delivery-charges.component';
import { UploadDeliveryChargesComponent } from './application/marketplace/upload-delivery-charges/upload-delivery-charges.component';
import { EditDistributionOfficerComponent } from './application/distribution-hub/edit-distribution-officer/edit-distribution-officer.component';
import { DefinePackagesComponent } from './application/procurement-section/define-packages/define-packages.component';
import { RetailComplaintsComponent } from './application/Complaints/retail-complaints/retail-complaints.component';
import { SelectedRetailComplaintsComponent } from './application/Complaints/selected-retail-complaints/selected-retail-complaints.component';
import { TodoDefinePremadePackagesComponent } from './application/procurement-section/todo-define-premade-packages/todo-define-premade-packages.component';
import { PackageItemViewComponent } from './application/dispatch-section/package-item-view/package-item-view.component';
import { AdditionalItemsComponent } from './application/dispatch-section/additional-items/additional-items.component';
import { CompletedDefinePackageComponent } from './application/procurement-section/completed-define-package/completed-define-package.component';
import { EditCompleatedDefinePremadePackagesComponent } from './application/procurement-section/edit-compleated-define-premade-packages/edit-compleated-define-premade-packages.component';
import { ViewDispatchOrdersComponent } from './application/procurement-section/view-dispatch-orders/view-dispatch-orders.component';
import { CustomAdditionalItemsComponent } from './application/dispatch-section/custom-additional-items/custom-additional-items.component';
import { ViewRetailCustomeresComponent } from './application/marketplace/view-retail-customeres/view-retail-customeres.component';
import { DefinePackageViewComponent } from './application/marketplace/define-package-view/define-package-view.component';
import { ViewPolygonCentersComponent } from './application/distribution-hub/view-polygon-centers/view-polygon-centers.component';
import { ViewDestributionCenterComponent } from './application/marketplace/view-destribution-center/view-destribution-center.component';
import { EditDistributionCentreComponent } from './application/distribution-hub/edit-distribution-centre/edit-distribution-centre.component';
import { ViewWholesaleCustomersComponent } from './application/marketplace/view-wholesale-customers/view-wholesale-customers.component';
import { ViewCustomerOrdersComponent } from './application/marketplace/view-customer-orders/view-customer-orders.component';
import { WholesaleComplaintsComponent } from './application/Complaints/wholesale-complaints/wholesale-complaints.component';
import { W } from '@angular/cdk/keycodes';
import { EditCoupenComponent } from './application/marketplace/edit-coupen/edit-coupen.component';
import { ViewWholwsaleOrdersComponent } from './application/marketplace/view-wholwsale-orders/view-wholwsale-orders.component';
import { SelectedwholesaleComplaintsComponent } from './application/Complaints/selected-wholesale-complaints/selected-wholesale-complaints.component';
import { CustomerOrdersComponent } from './application/sales-dash-section/customer-orders/customer-orders.component';
import { ViewHeadPortalComponent } from './application/distribution-hub/view-head-portal/view-head-portal.component';
import { ViewCurrentCenterTargetComponent } from './application/collection-hub-section/view-current-center-target/view-current-center-target.component';
import { ViewCenterHeadComponent } from './application/collection-hub-section/view-center-head/view-center-head.component';
import { ViewPackageHistoryComponent } from './application/marketplace/view-package-history/view-package-history.component';
import { TestingComponent } from './application/collection-hub-section/testing/testing.component';
import { CenterCollectionExpenceComponent } from './application/collection-hub-section/center-collection-expence/center-collection-expence.component';
import { DispatchMarketplaceComponent } from './application/dispatch-section/market-place-dispatch/dispatch-marketplace/dispatch-marketplace.component';
import { ViewPremadePackagesComponent } from './application/dispatch-section/market-place-dispatch/view-premade-packages/view-premade-packages.component';
import { DispachPackagesComponent } from './application/dispatch-section/dispatch-items/dispach-packages/dispach-packages.component';
import { DispatchAdditionalItemsComponent } from './application/dispatch-section/dispatch-items/dispatch-additional-items/dispatch-additional-items.component';
import { AssignCitiesComponent } from './application/distribution-hub/assign-cities/assign-cities.component';
import { MainDashboardLayoutComponent } from './application/distribution-hub/polygon-centers-dashboard/main-dashboard-layout/main-dashboard-layout.component';
import { UpdateDistributionOfficerComponent } from './application/steckholders-section/update-distribution-officer/update-distribution-officer.component';
import { ViewDistributionOfficerComponent } from './application/steckholders-section/view-distribution-officer/view-distribution-officer.component';
import { CreateDistributionOfficerComponent } from './application/steckholders-section/create-distribution-officer/create-distribution-officer.component';
import { SelectedOfficerTargetComponent } from './application/distribution-hub/polygon-centers-dashboard/selected-officer-target/selected-officer-target.component';
import { ViewFarmerStaffComponent } from './application/steckholders-section/view-farmer-staff/view-farmer-staff.component';
import { ViewExpencesFarmerReportComponent } from './application/collection-hub-section/view-expences-farmer-report/view-expences-farmer-report.component';
import { ViewFarmOwnerComponent } from './application/steckholders-section/view-farm-owner/view-farm-owner.component';
import { EditUserStaffComponent } from './application/steckholders-section/edit-user-staff/edit-user-staff.component';
import { FarmerFarmsComponent } from './application/plant-care-app/farmer-farms/farmer-farms.component';
import { FarmersFarmsFixedAssetsBuildingComponent } from './application/plant-care-app/farmers-farms-fixed-assets-building/farmers-farms-fixed-assets-building.component';
import { FarmerListFarmersFarmsComponent } from './application/plant-care-app/farmer-list-farmers-farms/farmer-list-farmers-farms.component';
import { FarmersFarmsFixedAssetsLandComponent } from './application/plant-care-app/farmers-farms-fixed-assets-lands/farmers-farms-fixed-assets-lands.component';
import { FinanceDashboardComponent } from './application/finance/finance-dashboard/finance-dashboard.component';
import path from 'path';
import { ResetPasswordComponent } from './application/main-components/reset-password/reset-password.component';
import { GoviLinkDashbordComponent } from './application/govi-link/govi-link-dashbord/govi-link-dashbord.component';
import { GovilinkComponent } from './application/govi-link/govilink/govilink.component';
import { AddacompanyComponent } from './application/govi-link/addacompany/addacompany.component';
import { AddCompanyDetailsComponent } from './application/plant-care-app/add-company-details/add-company-details';
import { ViewCompanyListComponent } from './application/plant-care-app/view-company-list/view-company-list.component';
import { AddServicesComponent } from './application/govi-link/add-services/add-services.component';
import { EditServicesComponent } from './application/govi-link/edit-services/edit-services.component';
import { ViewcompanylistComponent } from './application/govi-link/viewcompanylist/viewcompanylist.component';
import { EditacompanyComponent } from './application/govi-link/editacompany/editacompany.component';
import { EditCompanyDetailsComponent } from './application/plant-care-app/edit-company-details/edit-company-details';
import { ViewCompanyDetailsComponent } from './application/plant-care-app/view-company-details/view-company-details';
import { ViewFieldInspectorsComponent } from './application/steckholders-section/view-field-inspectors/view-field-inspectors';
import { ViewServicesListComponent } from './application/govi-link/view-services-list/view-services-list.component';
import { AddCertificateDetailsComponent } from './application/plant-care-app/add-certificate/add-certificate-details';
import { AddFiealdOfficerComponent } from './application/steckholders-section/add-fieald-officer/add-fieald-officer.component';
import { AddQuestionnaireDetailsComponent } from './application/plant-care-app/add-questionnaire/add-questionnaire-details';
import { FieldOfficerProfileComponent } from './application/steckholders-section/field-officer-profile/field-officer-profile.component';
import { ViewAllCertificatesComponent } from './application/plant-care-app/view-all-certificates/view-all-certificates.component';
import { EditQuestionnaireDetailsComponent } from './application/plant-care-app/edit-questionnaire/edit-questionnaire-details';
import { EditFiealdOfficerComponent } from './application/steckholders-section/edit-fieald-officer/edit-fieald-officer.component';
import { EditCertificateDetailsComponent } from './application/plant-care-app/edit-certificate/edit-certificate-details';
import { ViewCertificateDetailsComponent } from './application/plant-care-app/view-certificate/view-certificate-details';
import { ViewGoviLinkJobsComponent } from './application/govi-link/view-govi-link-jobs/view-govi-link-jobs';
import { AddFarmerClustersComponent } from './application/plant-care-app/add-farmer-clusters/add-farmer-clusters.component';
import { ViewAllDisributionComplainComponent } from './application/Complaints/distribution-complain/view-all-disribution-complain/view-all-disribution-complain.component';
import { ViewEachDistributedComplainComponent } from './application/Complaints/distribution-complain/view-each-distributed-complain/view-each-distributed-complain.component';
import { FinanceActionComponent } from './application/finance/finance-action/finance-action.component';
import { GovicarePackagesMainComponent } from './application/finance/govicare-packages/govicare-packages-main/govicare-packages-main.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  { path: 'login', component: LoginComponent },

  { path: 'status-451', component: Status451Component },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

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
          { path: 'dashboard', component: PlatCareDashbordComponent },
          {
            path: 'action',
            children: [
              {
                path: '',
                component: PlantcareComponent,
              },
              {
                path: 'create-news',
                component: CreateNewsComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Create a news' },
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
                canActivate: [PermissionGuard],
                data: { permission: 'Create crop calendar' },
              },
              {
                path: 'edit-crop-calender',
                component: CreateCropCalenderComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Edit crop calendar' },
              },
              {
                path: 'view-crop-calender',
                component: ViewCropCalanderComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'View crop calendar' },
              },
              {
                path: 'view-crop-task/:cropId',
                component: ViewCropTaskComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'View crop calendar task' },
              },

              {
                path: 'edit-crop-task/:id',
                component: EditTaskComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Edit task' },
              },
              {
                path: 'public-forum',
                component: PublicForumComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'View post list of the public forum' },
              },
              {
                path: 'ongoing-cultivation',
                component: OngoingCultivationComponent,
                canActivate: [PermissionGuard],
                data: {
                  permission: 'View users that enroll with crop calendars',
                },
              },
              {
                path: 'farmers-farm',
                component: FarmerFarmsComponent,
              },
              {
                path: 'view-crop-task-by-user',
                component: SlaveCropCalendarComponent,
                canActivate: [PermissionGuard],
                data: {
                  permission: 'View each farmer’s enrolled crop calendars',
                },
              },
              {
                path: 'view-crop-task-by-user/user-task-list/edit-user-task',
                component: UserTaskEditComponent,
              },
              {
                path: 'view-crop-task-by-user/user-task-list',
                component: UserCropCalendarComponent,
                canActivate: [PermissionGuard],
                data: {
                  permission: 'View each farmer’s crop calendar task list',
                },
              },

              {
                path: 'report-farmer-list',
                component: ReportsFarmerListComponent,
              },
              {
                path: 'Farmers-farms-list',
                component: FarmerListFarmersFarmsComponent,
              },
              {
                path: 'report-farmer-current-assert/:userId/:name/:farmId',
                component: ReportCurrentAssertsComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'View users current assets by category' },
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
                canActivate: [PermissionGuard],
                data: { permission: 'View users fixed assets by category' },
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
                path: 'assets/fixed-asset-category/building-fixed-asset/details',
                component: FarmersFarmsFixedAssetsBuildingComponent,
              },
              {
                path: 'assets/fixed-asset-category/land-fixed-asset/details',
                component: FarmersFarmsFixedAssetsLandComponent,
              },
              {
                path: 'add-new-crop-task/:cropId/:indexId/:userId/:onCulscropID ',
                component: AddNewCropCalanderTaskComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Add new task' },
              },
              {
                path: 'add-block-words',
                component: AddBlockWordsComponent,
              },
              {
                path: 'create-crop-group',
                component: CreateCropGroupComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Create crop group' },
              },
              {
                path: 'edit-crop-group',
                component: CreateCropGroupComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Edit crop group' },
              },
              {
                path: 'view-crop-group',
                component: ViewCropGroupComponent,
              },
              {
                path: 'create-crop-variety',
                component: CreateVarietyComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Add varieties' },
              },
              {
                path: 'edit-crop-variety',
                component: CreateVarietyComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Edit varieties' },
              },
              {
                path: 'view-crop-variety',
                component: ViewVarietyComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'View varieties of each group' },
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
                    canActivate: [PermissionGuard],
                    data: { permission: 'Manage Opt-Out feedback list' },
                  },
                ],
              },
              {
                path: 'add-company-details',
                component: AddCompanyDetailsComponent,
              },
              {
                path: 'add-certificate-details',
                component: AddCertificateDetailsComponent,
              },
              {
                path: 'view-certificate-details/:certificateId',
                component: ViewCertificateDetailsComponent,
              },
              {
                path: 'edit-certificate-details/:certificateId',
                component: EditCertificateDetailsComponent,
              },
              {
                path: 'add-questionnaire-details/:certificateId',
                component: AddQuestionnaireDetailsComponent,
              },
              {
                path: 'edit-questionnaire-details/:certificateId',
                component: EditQuestionnaireDetailsComponent,
              },
              {
                path: 'edit-company-details/:id',
                component: EditCompanyDetailsComponent,
              },
              {
                path: 'view-company-details/:id',
                component: ViewCompanyDetailsComponent,
              },
              {
                path: 'view-company-list',
                component: ViewCompanyListComponent,
              },
              {
                path: 'view-certificate-list',
                component: ViewAllCertificatesComponent,
              },
              {
                path: 'add-farmer-clusters',
                component: AddFarmerClustersComponent,
              },
            ],
          },
        ],
      },

      {
        path: 'finance',
        children: [
          { path: 'dashboard', component: FinanceDashboardComponent },
          {
            path: 'action',
            children: [
              { path: '', component: FinanceActionComponent },
              {
                path: 'govicare-packages',
                component: GovicarePackagesMainComponent,
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
            canActivate: [PermissionGuard],
            data: {
              permission: 'View and download collection officer reports',
            },
          },
          {
            path: 'collective-officer-report/view/:id/:name',
            component: CollectionOfficerReportViewComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Collection Officer Daily Report' },
          },
          {
            path: 'collective-officer/district-report',
            component: CollectionofficerDistrictReportComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'View and download district report' },
          },
          {
            path: 'payment-slip-report/:id',
            component: PaymentSlipReportComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Collection Officer Farmer Report' },
          },
          {
            path: 'farmer-list-report',
            component: FarmerListReportComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Collection Officer Farmer Report' },
          },
          {
            path: 'collective-officer/province-report',
            component: CollectionOfficerProvinceReportComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'View and download province report' },
          },
          {
            path: 'collective-officer-report/monthly-report/:id',
            component: MonthlyReportComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Collection Officer Monthly Report' },
          },
          {
            path: 'purchase-report',
            component: PurchaseReportComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'View and download purchase report' },
          },
          {
            path: 'collection-report',
            component: CollectionReportComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'View and download collection report' },
          },
        ],
      },

      {
        path: 'steckholders',
        children: [
          {
            path: 'dashboard',
            component: DashboardMainComponent,
          },
          {
            path: 'action',
            children: [
              {
                path: '',
                component: SteckholdersComponent,
              },
              {
                path: 'view-distribution-officers',
                children: [
                  {
                    path: '',
                    component: ViewDistributionOfficerComponent,
                  },
                  {
                    path: 'create-distribution-officer',
                    component: CreateDistributionOfficerComponent,
                  },
                  {
                    path: 'update-distribution-officer/:id',
                    component: UpdateDistributionOfficerComponent,
                  },
                ],
              },
              {
                path: 'add-fieald-officer',
                component: AddFiealdOfficerComponent,
              },
              {
                path: 'add-distribution-0fficer',
                component: AddDistributionOfficerComponent,
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
                    canActivate: [PermissionGuard],
                    data: { permission: ['Manage plant care users'] },
                  },
                  {
                    path: 'create-plantcare-users',
                    component: EditPlantcareUsersComponent,
                    canActivate: [PermissionGuard],
                    data: {
                      permission: ['Onboard individual plant care user'],
                    },
                  },
                  {
                    path: 'view-plantcare-users',
                    component: EditPlantcareUsersComponent,
                    canActivate: [PermissionGuard],
                    data: { permission: ['View individual plantcare user'] },
                  },
                  {
                    path: 'upload-farmers',
                    component: UserBulkUploadComponent,
                    canActivate: [PermissionGuard],
                    data: { permission: 'Bulk onboarding plan care users' },
                  },
                  {
                    path: 'view-farmer-staff/:id',
                    component: ViewFarmerStaffComponent,
                  },
                  {
                    path: 'view-farmer-owner/:id',
                    component: ViewFarmOwnerComponent,
                  },
                  {
                    path: 'edit-user-staff/:id',
                    component: EditUserStaffComponent,
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
                    canActivate: [PermissionGuard],
                    data: { permission: 'Onboard individual admin user' },
                  },
                ],
              },

              {
                path: 'sales-agents',
                children: [
                  {
                    path: '',
                    component: ViewSalesAgentsComponent,
                  },
                  {
                    path: 'create-sales-agents',
                    component: CreateSalesAgentsComponent,
                    canActivate: [PermissionGuard],
                    data: { permission: ['Onboard sales agent'] },
                  },
                  {
                    path: 'edit-sales-agents/:id',
                    component: EditSalesAgentComponent,
                    canActivate: [PermissionGuard],
                    data: { permission: ['Manage sales agent'] },
                  },

                  {
                    path: 'preview-sales-agents/:id',
                    component: PreviewSalesAgentsComponent,
                    canActivate: [PermissionGuard],
                    data: { permission: ['View individual sales agent'] },
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
                    canActivate: [PermissionGuard],
                    data: {
                      permission: 'Onboard individual collection CO / CCM / DO',
                    },
                  },
                  {
                    path: 'personal-edit/:id',
                    component: CollectiveofficersEditComponent,
                    canActivate: [PermissionGuard],
                    data: { permission: 'Manage CO / CCM / DO' },
                  },
                  {
                    path: 'company',
                    component: CollectiveofficersCompanyComponent,
                  },
                  {
                    path: 'bank-details',
                    component: CollectiveofficersBankDetailsComponent,
                  },
                  {
                    path: 'collective-officer-profile/:id',
                    component: ViewCollectiveOfficerProfileComponent,
                    canActivate: [PermissionGuard],
                    data: { permission: 'View individual collection officer' },
                  },
                  {
                    path: 'view-officer-targets/:officerId',
                    component: ViewOfficerTargetComponent,
                  },
                ],
              },

              {
                path: 'field-inspectors',
                children: [
                  {
                    path: '',
                    component: ViewFieldInspectorsComponent,
                  },
                ],
              },

              {
                path: 'field-officer-profile/:id',
                children: [
                  {
                    path: '',
                    component: FieldOfficerProfileComponent,
                  },
                ],
              },
              {
                path: 'edit-field-officer/:id',
                component: EditFiealdOfficerComponent,
              },
              {
                path: 'stakholder-collection-centers',
                component: CollectionAllViewComponent,
              },
              {
                path: 'stakholder-distributed-centers',
                component: ViewPolygonCentersComponent,
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
            canActivate: [PermissionGuard],
            data: { permission: 'View Current Market Prices' },
          },
          {
            path: 'delete-bulk-price',
            component: MarketPriceBulkDeleteComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Delete Market Prices' },
          },
          {
            path: 'price-bulk-upload',
            component: MarketPriceBulkUploadComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Add Market Prices' },
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
            path: 'view-current-centre-target/:centerId',
            component: ViewCurrentCenterTargetComponent,
          },
          {
            path: 'collection-center-dashboard/:id/:comid/:centerName',
            component: CollectionCenterDashboardComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'View Collection Center' },
          },
          {
            path: 'update-collection-center/:id',
            component: EditCollectionCenterComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Edit Collection Center' },
          },
          {
            path: 'create-company',
            component: CreateCompanyComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Add And Edit Company' },
          },
          {
            path: 'manage-company',
            component: ManageCompanyComponent,
          },
          {
            path: 'add-collection-center',
            component: AddCollectionCenterComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Add Collection Center' },
          },
          {
            path: 'add-daily-target/:id/:name/:regCode',
            component: AddDailyTargetComponent,
            canActivate: [PermissionGuard],
            data: { permission: 'Assign Center Target' },
          },
          {
            path: 'view-company-head',
            component: ViewCompanyHeadComponent,
          },
          {
            path: 'create-center-head',
            component: CreateCenterHeadComponent,
          },
          {
            path: 'edit-center-head/:id',
            component: EditCenterHeadComponent,
          },
          // {
          //   path: 'agro-world-centers',
          //   component: TestingComponent,
          // },
          {
            path: 'agro-world-centers',
            component: AgroWorldCentersComponent,
          },
          {
            path: 'agro-world-center-price/:centerId/:companyId/:centerName',
            component: ViewCenterPriceComponent,
          },
          {
            path: 'preview-collection-center/:id',
            component: PreviewCollectionCenterComponent,
          },
          {
            path: 'view-center-head/:id',
            component: ViewCenterHeadComponent,
          },
          {
            path: 'center-collection-expense/:id',
            component: CenterCollectionExpenceComponent,
          },
          {
            path: 'view-center-officers',
            component: ViewCollectiveOfficerComponent,
          },
          {
            path: 'farmer-report-invoice/:invNo',
            component: ViewExpencesFarmerReportComponent,
          },
        ],
      },

      {
        path: 'procurement',
        children: [
          {
            path: '',
            component: ProcurementComponent,
          },
          {
            path: 'received-orders',
            component: RecievedOrdersComponent,
          },

          {
            path: 'define-packages',
            component: DefinePackagesComponent,
          },
          {
            path: 'todo-define-premade-packages',
            component: TodoDefinePremadePackagesComponent,
          },
          {
            path: 'edit-completed-define-package',
            component: EditCompleatedDefinePremadePackagesComponent,
          },
          {
            path: 'view-dispatched-define-package',
            component: ViewDispatchOrdersComponent,
          },
        ],
      },

      {
        path: 'dispatch',
        children: [
          {
            path: '',
            component: DispatchComponent,
          },
          {
            path: 'salesdash-orders',
            component: SalesdashOrdersComponent,
          },

          {
            path: 'package-items',
            component: PackageItemViewComponent,
          },

          {
            path: 'additional-items',
            component: AdditionalItemsComponent,
          },

          {
            path: 'custom-additional-items',
            component: CustomAdditionalItemsComponent,
          },
          {
            path: 'marketplace-dispatch',
            component: DispatchMarketplaceComponent,
          },
          {
            path: 'view-premade-packages/:id/:inv',
            component: ViewPremadePackagesComponent,
          },
          {
            path: 'dispatch-package/:id/:orderId',
            component: DispachPackagesComponent,
          },
          {
            path: 'dispatch-additional-items/:id',
            component: DispatchAdditionalItemsComponent,
          },
        ],
      },

      {
        path: 'market',
        children: [
          {
            path: 'dashboard',
            component: MarketPlaceDashbordComponent,
          },
          {
            path: 'action',
            children: [
              {
                path: '',
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
              {
                path: 'edit-product/:id',
                component: MarketEditProductComponent,
              },
              {
                path: 'view-packages-history',
                component: ViewPackageHistoryComponent,
              },
              {
                path: 'view-packages-list',
                component: ViewPackageListComponent,
              },
              {
                path: 'edit-packages/:id',
                component: MarketEditPackagesComponent,
              },
              {
                path: 'view-package-details/:id',
                component: ViewPackageDetailsComponent,
              },
              {
                path: 'banner-list',
                component: BannerListComponent,
              },
              {
                path: 'view-product-types',
                component: ViewProductTypesComponent,
              },
              {
                path: 'add-product-type',
                component: AddProductTypesComponent,
              },
              {
                path: 'subscription',
                component: SubsriptionComponent,
              },
              {
                path: 'edit-product-type/:id',
                component: EditProductTypesComponent,
              },

              {
                path: 'view-retail-orders',
                component: ViewRetailOrdersComponent,
              },

              {
                path: 'view-delivery-charges',
                component: ViewDeliveryChargesComponent,
              },
              {
                path: 'upload-delivery-charges',
                component: UploadDeliveryChargesComponent,
              },
              {
                path: 'view-retail-customers',
                component: ViewRetailCustomeresComponent,
              },
              {
                path: 'define-package-view',
                component: DefinePackageViewComponent,
              },
              {
                path: 'view-package-history',
                component: ViewPackageHistoryComponent,
              },
              {
                path: 'view-wholesale-customers',
                component: ViewWholesaleCustomersComponent,
              },
              {
                path: 'view-order-details/:id',
                component: ViewCustomerOrdersComponent,
              },
              {
                path: 'edit-coupen/:id',
                component: EditCoupenComponent,
              },
              {
                path: 'view-wholesale-orders',
                component: ViewWholwsaleOrdersComponent,
              },
            ],
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
            path: 'customer',
            component: CustomersComponent,
          },

          {
            path: 'view-orders',
            component: ViewOrdersComponent,
          },

          {
            path: 'sales-targets',
            component: SalesTargetComponent,
          },
          {
            path: 'customers-orders/:id',
            component: CustomerOrdersComponent,
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
          {
            path: 'manage-applications',
            component: ManageApplicationsComponent,
          },
          {
            path: 'add-complain-Categories',
            component: AddComplainCategoriesComponent,
          },
          {
            path: 'manage-complaints-categories/:id',
            component: ManageComplaintsCategoriesComponent,
          },
          {
            path: 'edit-complaint-categories/:id',
            component: EditComplainCagegoriesComponent,
          },
          {
            path: 'view-selected-complain/:id/:farmerName',
            component: ViewSelectedComplainComponent,
          },
          {
            path: 'view-center-complain/:id',
            component: ViewCenterComplainComponent,
          },
          {
            path: 'view-sales-dash-complain',
            component: ViewSalesDashComplaintsComponent,
          },
          {
            path: 'view-selected-sales-dash-complain/:id/:firstName',
            component: ViewSelectedSalesDashComplainComponent,
          },
          {
            path: 'retail-complaints',
            component: RetailComplaintsComponent,
          },
          {
            path: 'wholesale-complaints',
            component: WholesaleComplaintsComponent,
          },
          {
            path: 'selected-retail-complaints/:id',
            component: SelectedRetailComplaintsComponent,
          },
          {
            path: 'selected-wholesale-complaints/:id',
            component: SelectedwholesaleComplaintsComponent,
          },
          {
            path: 'distributed-center-complains',
            children: [
              {
                path: '',
                component: ViewAllDisributionComplainComponent,
              },
              {
                path: 'view-complain/:id',
                component: ViewEachDistributedComplainComponent,
              },
            ],
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            component: ComplaintsDashbordComponent,
          },
          {
            path: 'view-roles',
            component: RoleSelectionComponent,
          },
          {
            path: 'give-permissions/:id',
            component: PermissionAreaComponent,
          },
        ],
      },
      {
        path: 'distribution-hub',
        children: [
          { path: 'dashboard', component: DistributionHubDashboardComponent },
          {
            path: 'action',
            children: [
              { path: '', component: DistributionhubComponent },
              {
                path: 'create-company',
                component: CreateCompanyComponent,
                canActivate: [PermissionGuard],
                data: { permission: 'Add And Edit Company' },
              },
              {
                path: 'view-companies',
                component: ViewCompaniesComponent,
              },
              {
                path: 'view-distribution-company',
                component: DistributionViewCompanyComponent,
              },
              {
                path: 'view-destribition-center',
                component: ViewDistributionCenterComponent,
              },
              {
                path: 'add-distribution-officer/:id/:companyName',
                component: AddDistributionOfficerComponent,
              },

              {
                path: 'add-destribition-center',
                component: AddDestributionCenterComponent,
              },
              {
                path: 'edit-distribution-officer/:id',
                component: EditDistributionOfficerComponent,
              },
              {
                path: 'view-polygon-centers',
                children: [
                  {
                    path: '',
                    component: ViewPolygonCentersComponent,
                  },
                  {
                    path: 'distribution-center-dashboard/:id',
                    component: MainDashboardLayoutComponent,
                  },
                  {
                    path: 'edit-distribution-officer/:id',
                    component: UpdateDistributionOfficerComponent,
                  },

                  {
                    path: 'selected-officer-target',
                    component: SelectedOfficerTargetComponent,
                  },
                ],
              },
              {
                path: 'view-distribution-centre/:id',
                component: ViewDestributionCenterComponent,
              },
              {
                path: 'edit-distribution-centre/:id',
                component: EditDistributionCentreComponent,
              },
              {
                path: 'view-head-portal/:id',
                component: ViewHeadPortalComponent,
              },
              {
                path: 'assign-cities',
                component: AssignCitiesComponent,
              },
            ],
          },
        ],
      },
      {
        path: 'govi-link',
        children: [
          {
            path: 'dashboard',
            component: GoviLinkDashbordComponent,
          },
          {
            path: 'action',
            children: [
              {
                path: '',
                component: GovilinkComponent,
              },
              {
                path: 'add-a-company',
                component: AddacompanyComponent,
              },
              {
                path: 'view-company-list',
                component: ViewcompanylistComponent,
              },
              {
                path: 'edit-company',
                component: EditacompanyComponent,
              },
              {
                path: 'add-services',
                component: AddServicesComponent,
              },
              {
                path: 'edit-services/:id',
                component: EditServicesComponent,
              },
              {
                path: 'view-services-list',
                component: ViewServicesListComponent,
              },
              {
                path: 'view-govi-link-jobs',
                component: ViewGoviLinkJobsComponent,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
