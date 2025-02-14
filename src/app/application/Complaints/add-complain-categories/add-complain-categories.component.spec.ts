import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComplainCategoriesComponent } from './add-complain-categories.component';

describe('AddComplainCategoriesComponent', () => {
  let component: AddComplainCategoriesComponent;
  let fixture: ComponentFixture<AddComplainCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddComplainCategoriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddComplainCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
