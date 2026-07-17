import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDriverCategoriesComponent } from './view-driver-categories.component';

describe('ViewDriverCategoriesComponent', () => {
  let component: ViewDriverCategoriesComponent;
  let fixture: ComponentFixture<ViewDriverCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDriverCategoriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDriverCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
