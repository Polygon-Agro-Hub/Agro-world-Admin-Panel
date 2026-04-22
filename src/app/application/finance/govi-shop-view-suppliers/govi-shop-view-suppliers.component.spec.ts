import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviShopViewSuppliersComponent } from './govi-shop-view-suppliers.component';

describe('GoviShopViewSuppliersComponent', () => {
  let component: GoviShopViewSuppliersComponent;
  let fixture: ComponentFixture<GoviShopViewSuppliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviShopViewSuppliersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviShopViewSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
