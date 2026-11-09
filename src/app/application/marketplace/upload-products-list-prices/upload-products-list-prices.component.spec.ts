import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadProductsListPricesComponent } from './upload-products-list-prices.component';

describe('UploadProductsListPricesComponent', () => {
  let component: UploadProductsListPricesComponent;
  let fixture: ComponentFixture<UploadProductsListPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadProductsListPricesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadProductsListPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
