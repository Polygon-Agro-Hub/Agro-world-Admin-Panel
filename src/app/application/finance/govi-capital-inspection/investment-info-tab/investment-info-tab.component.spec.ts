import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentInfoTabComponent } from './investment-info-tab.component';

describe('InvestmentInfoTabComponent', () => {
  let component: InvestmentInfoTabComponent;
  let fixture: ComponentFixture<InvestmentInfoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentInfoTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvestmentInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
