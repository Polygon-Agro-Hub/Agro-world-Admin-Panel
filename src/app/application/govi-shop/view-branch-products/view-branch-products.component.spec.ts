import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBranchProductsComponent } from './view-branch-products.component';

describe('ViewBranchProductsComponent', () => {
  let component: ViewBranchProductsComponent;
  let fixture: ComponentFixture<ViewBranchProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBranchProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewBranchProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
