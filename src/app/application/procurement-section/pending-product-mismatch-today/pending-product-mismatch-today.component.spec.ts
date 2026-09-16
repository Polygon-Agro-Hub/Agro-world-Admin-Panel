import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingProductMismatchTodayComponent } from './pending-product-mismatch-today.component';

describe('PendingProductMismatchTodayComponent', () => {
  let component: PendingProductMismatchTodayComponent;
  let fixture: ComponentFixture<PendingProductMismatchTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingProductMismatchTodayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingProductMismatchTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
