import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageComplaintsCategoriesComponent } from './manage-complaints-categories.component';

describe('ManageComplaintsCategoriesComponent', () => {
  let component: ManageComplaintsCategoriesComponent;
  let fixture: ComponentFixture<ManageComplaintsCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageComplaintsCategoriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageComplaintsCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
