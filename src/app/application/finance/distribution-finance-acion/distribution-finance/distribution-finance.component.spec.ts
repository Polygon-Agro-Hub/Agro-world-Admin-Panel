import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionFinanceComponent } from './distribution-finance.component';

describe('DistributionFinanceComponent', () => {
  let component: DistributionFinanceComponent;
  let fixture: ComponentFixture<DistributionFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionFinanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributionFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
