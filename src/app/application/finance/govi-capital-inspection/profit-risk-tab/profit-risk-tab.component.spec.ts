import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitRiskTabComponent } from './profit-risk-tab.component';

describe('ProfitRiskTabComponent', () => {
  let component: ProfitRiskTabComponent;
  let fixture: ComponentFixture<ProfitRiskTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfitRiskTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfitRiskTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
