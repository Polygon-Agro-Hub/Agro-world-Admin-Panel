import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPikupCashRevenueComponent } from './view-pikup-cash-revenue.component';

describe('ViewPikupCashRevenueComponent', () => {
  let component: ViewPikupCashRevenueComponent;
  let fixture: ComponentFixture<ViewPikupCashRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPikupCashRevenueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPikupCashRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
