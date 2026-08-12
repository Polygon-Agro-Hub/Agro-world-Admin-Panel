import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditDriverCategoryComponent } from './add-edit-driver-category.component';

describe('AddEditDriverCategoryComponent', () => {
  let component: AddEditDriverCategoryComponent;
  let fixture: ComponentFixture<AddEditDriverCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditDriverCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditDriverCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
