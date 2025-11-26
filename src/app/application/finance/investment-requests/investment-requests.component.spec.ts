import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentRequestsComponent } from './investment-requests.component';

describe('InvestmentRequestsComponent', () => {
  let component: InvestmentRequestsComponent;
  let fixture: ComponentFixture<InvestmentRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvestmentRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
