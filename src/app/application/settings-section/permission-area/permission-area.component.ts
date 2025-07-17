import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionManagerService } from '../../../services/permission-manager/permission-manager.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface Category {
  id: number;
  category: string;
}

@Component({
  selector: 'app-permission-area',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    ToastModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './permission-area.component.html',
  styleUrl: './permission-area.component.css',
  providers: [MessageService],
})
export class PermissionAreaComponent {
  isLoading = false;
  featureCategoryList: any[] = [];
  positionList: any[] = [];
  FeatureList: any[] = [];
  RoleFeatureList: any[] = [];
  editFeatureObj: Feature = new Feature();
  editCategoryObj: EditCategory = new EditCategory();

  role_id!: number;
  createCategroyObj: CreateCategory = new CreateCategory();
  categories: { id: number; category: string }[] = [];
  selectedCategory: string | number = '';
  newCategory: string = '';
  isFeatureEdit: boolean = false;
  existEditName: string = '';

  isCategoryEdit: boolean = false;
  existCategoryName: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private permissionManagerService: PermissionManagerService,
    private tokenService: TokenService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.role_id = this.route.snapshot.params['id'];
    console.log(this.role_id);
    this.getAllPosition();
    this.getAllFeatures();
    this.getAllRoleFeatures();
    this.getAllfeatureCategory();
  }

  getAllPosition() {
    this.isLoading = true;
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get<any>(`${environment.API_URL}auth/get-all-position`, {
        headers,
      })
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.positionList = response.positions;
          console.log(response);
        },
        (error) => {
          console.error('Error fetching news:', error);
        }
      );
  }

  addCategory() {
    this.permissionManagerService
      .createCategory(
        this.createCategroyObj.category,
        this.selectedCategory,
        this.newCategory
      )
      ?.subscribe(
        (response) => {
          if (response.status) {
            Swal.fire({
              title: 'Success!',
              text: 'New feature has been added to the list successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then((result) => {
              if (result.isConfirmed) {
                this.getAllPosition();
                this.getAllFeatures();
                this.getAllRoleFeatures();
                this.getAllfeatureCategory();
                this.newCategory = '';
                this.createCategroyObj.category = '';

              }
            });
          } else {
            Swal.fire("Error!", response.message, 'error');
          }
        },
        (error) => {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to create feature.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
  }

  getAllFeatures() {
    this.isLoading = true;
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any>(`${environment.API_URL}permission/get-all-features`, {
        headers,
      })
      .subscribe(
        (response) => {
          // Transform API response to group features by category
          console.log('Main responce -> ', response);
          this.isLoading = false;
          const groupedFeatures = response.features.reduce(
            (acc: any[], feature: any) => {
              let category = acc.find((c) => c.category === feature.category);
              if (!category) {
                category = {
                  category: feature.category,
                  categoryId: feature.categoryId,
                  features: [],
                };
                acc.push(category);
              }
              category.features.push(feature);
              return acc;
            },
            []
          );

          this.FeatureList = groupedFeatures;
          console.log(this.FeatureList);
        },
        (error) => {
          console.error('Error fetching features:', error);
        }
      );
  }

  getAllRoleFeatures() {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get<any>(
        `${environment.API_URL}permission/get-all-role-features/${this.role_id}`,
        {
          headers,
        }
      )
      .subscribe(
        (response) => {
          this.RoleFeatureList = response.role_features;
          console.log(response);
        },
        (error) => {
          console.error('Error fetching news:', error);
        }
      );
  }

  isChecked(featureId: number, positionId: number): boolean {
    return this.RoleFeatureList.some(
      (roleFeature) =>
        roleFeature.featureId === featureId &&
        roleFeature.positionId === positionId
    );
  }

  onCheckboxChange(event: any, featureId: number, positionId: number): void {
    if (event.target.checked) {
      // Handle the addition of a role feature
      const roleFeatureData = {
        role_id: this.role_id,
        position_id: positionId,
        feature_id: featureId,
      };

      const token = this.tokenService.getToken();
      if (!token) {
        console.error('No token found');
        return;
      }
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.http
        .post(
          `${environment.API_URL}permission/create-role-feature`,
          roleFeatureData,
          { headers }
        )
        .subscribe({
          next: (response: any) => {
            if (response.status) {
              console.log('Give Permission successfully:', response);
              this.RoleFeatureList.push({
                feature_id: featureId,
                position_id: positionId,
                role_id: this.role_id,
              });

              // Display success Swal alert
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Gave Permission Sucessfully!',
                life: 3000,
              });
            }
          },
          error: (error) => {
            console.error('Error creating role feature:', error);

            // Display error Swal alert
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to Give Permission. Please try again.',
              life: 3000,
            });
          },
        });
    } else {
      // Handle the removal of a role feature
      const token = this.tokenService.getToken();
      if (!token) {
        console.error('No token found');
        return;
      }
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      // Find the role feature ID from the existing RoleFeatureList
      const roleFeature = this.RoleFeatureList.find(
        (item) => item.featureId === featureId && item.positionId === positionId
      );

      if (roleFeature) {
        const roleId = roleFeature.id;

        this.http
          .delete(
            `${environment.API_URL}permission/delete-role-feature/${roleId}`,
            { headers }
          )
          .subscribe({
            next: (response: any) => {
              console.log('Give Permission deleted successfully:', response);

              // Remove the deleted feature from the list
              this.RoleFeatureList = this.RoleFeatureList.filter(
                (item) => item.id !== roleId
              );

              // Display success Swal alert
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Give Permission removed successfully!',
                life: 2000,
              });
            },
            error: (error) => {
              console.error('Error deleting role feature:', error);

              // Display error Swal alert
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete role feature. Please try again.',
                life: 3000,
              });
            },
          });
      } else {
        console.error('Role feature not found for deletion');
      }
    }
  }

  onCategoryChange(event: any) {
    console.log('Selected Category ID:', this.selectedCategory); // This will now log the string ID
    if (this.selectedCategory !== 'add_new' && this.selectedCategory !== '') {
      const selectedCategoryObj = this.categories.find(
        (cat) => cat.id.toString() === this.selectedCategory
      );
      if (selectedCategoryObj) {
        console.log('Selected Category:', selectedCategoryObj.category);
      }
    }
  }

  addNewCategory() {
    if (this.newCategory.trim()) {
      const newId = this.categories.length + 1; // You can generate an ID or use the API to add the category
      this.categories.push({ id: newId, category: this.newCategory });
      this.selectedCategory = newId.toString(); // Set the newly added category as selected
    }
  }

  setSelectedCategoryIfMatch() {
    if (this.newCategory !== '') {
      const foundCategory = this.categories.find(
        (cat: any) => cat.category === this.newCategory
      );

      if (foundCategory) {
        this.selectedCategory = foundCategory.id;
      } else {
        // Optional: handle case when no match is found
        this.selectedCategory = ''; // or undefined or whatever default you prefer
      }
    }
  }

  getAllfeatureCategory() {
    this.isLoading = true;

    this.permissionManagerService.getFeatureCategories().subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response.featureCategories) {
          // Map response to categories and store both id and category
          this.categories = response.featureCategories.map((cat: Category) => ({
            id: cat.id,
            category: cat.category,
          }));
          this.setSelectedCategoryIfMatch()
        } else {
          console.error('Invalid response structure:', response);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching categories:', error);
      }
    );
  }

  editFeature(id: number, fetureName: string) {
    this.editFeatureObj = {
      id: id,
      name: fetureName,
    };
    this.existEditName = fetureName;
    this.isFeatureEdit = true;
  }

  editFeatureOnSubmit() {
    if (this.existEditName === this.editFeatureObj.name) {
      Swal.fire(
        'Warning',
        'The name is the same. Please edit the name before saving!',
        'warning'
      );
      return;
    }

    if (!this.editFeatureObj.name) {
      Swal.fire('Warning', 'Please Fill the name before saving!', 'warning');
      return;
    }

    this.permissionManagerService
      .editFeatureName(this.editFeatureObj)
      .subscribe((res) => {
        if (res.status) {
          Swal.fire('Successfull', res.message, 'success');
          this.isFeatureEdit = false;
          this.editFeatureObj = new Feature();
          this.isLoading = true;
          this.getAllPosition();
          this.getAllFeatures();
          this.getAllRoleFeatures();
          this.getAllfeatureCategory();
          this.isLoading = false;
        } else {
          Swal.fire('Error', res.message, 'error');
        }
      });
  }

  cancelEditFeature() {
    this.isFeatureEdit = false;
    this.editFeatureObj = new Feature();
  }

  editCategory(id: number, categoryName: string) {
    this.editCategoryObj = {
      id: id,
      name: categoryName,
    };
    this.existCategoryName = categoryName;
    this.isCategoryEdit = true;
  }

  cancelEditCategoriy() {
    this.isCategoryEdit = false;
    this.editCategoryObj = new EditCategory();
  }

  editCategoryOnSubmit() {
    console.log(this.editCategoryObj);

    if (this.existCategoryName === this.editCategoryObj.name) {
      Swal.fire(
        'Warning',
        'The name is the same. Please edit the name before saving!',
        'warning'
      );
      return;
    }

    if (!this.editCategoryObj.name) {
      Swal.fire('Warning', 'Please Fill the name before saving!', 'warning');
      return;
    }

    this.permissionManagerService
      .editCategoryName(this.editCategoryObj)
      .subscribe((res) => {
        if (res.status) {
          Swal.fire('Successfull', res.message, 'success');
          this.isCategoryEdit = false;
          this.editCategoryObj = new EditCategory();
          this.isLoading = true;
          this.getAllPosition();
          this.getAllFeatures();
          this.getAllRoleFeatures();
          this.getAllfeatureCategory();
          this.isLoading = false;
        } else {
          Swal.fire('Error', res.message, 'error');
        }
      });
  }

  viewConsole() {
    console.log("categories", this.categories);

  }
}

export class CreateCategory {
  category!: string;
}

class Feature {
  id!: number;
  name!: string;
}

class EditCategory {
  id!: number;
  name!: string;
}
