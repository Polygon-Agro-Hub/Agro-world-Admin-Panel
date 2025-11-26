import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerPaymentsComponent } from './farmer-payments.component';

describe('FarmerPaymentsComponent', () => {
  let component: FarmerPaymentsComponent;
  let fixture: ComponentFixture<FarmerPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerPaymentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FarmerPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
