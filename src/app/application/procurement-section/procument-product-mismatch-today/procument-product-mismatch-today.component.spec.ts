import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcumentProductMismatchTodayComponent } from './procument-product-mismatch-today.component';

describe('ProcumentProductMismatchTodayComponent', () => {
  let component: ProcumentProductMismatchTodayComponent;
  let fixture: ComponentFixture<ProcumentProductMismatchTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcumentProductMismatchTodayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcumentProductMismatchTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
