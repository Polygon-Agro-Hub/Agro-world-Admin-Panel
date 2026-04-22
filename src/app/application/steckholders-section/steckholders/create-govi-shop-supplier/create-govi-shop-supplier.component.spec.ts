import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGoviShopSupplierComponent } from './create-govi-shop-supplier.component';

describe('CreateGoviShopSupplierComponent', () => {
  let component: CreateGoviShopSupplierComponent;
  let fixture: ComponentFixture<CreateGoviShopSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGoviShopSupplierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateGoviShopSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
