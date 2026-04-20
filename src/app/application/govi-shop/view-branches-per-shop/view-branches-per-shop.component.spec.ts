import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBranchesPerShopComponent } from './view-branches-per-shop.component';

describe('ViewBranchesPerShopComponent', () => {
  let component: ViewBranchesPerShopComponent;
  let fixture: ComponentFixture<ViewBranchesPerShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBranchesPerShopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewBranchesPerShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
