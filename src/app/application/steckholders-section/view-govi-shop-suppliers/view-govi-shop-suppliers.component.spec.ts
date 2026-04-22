import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGoviShopSuppliersComponent } from './view-govi-shop-suppliers.component';

describe('ViewGoviShopSuppliersComponent', () => {
  let component: ViewGoviShopSuppliersComponent;
  let fixture: ComponentFixture<ViewGoviShopSuppliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGoviShopSuppliersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewGoviShopSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
