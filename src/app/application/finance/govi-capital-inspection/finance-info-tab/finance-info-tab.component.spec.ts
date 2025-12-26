import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceInfoTabComponent } from './finance-info-tab.component';

describe('FinanceInfoTabComponent', () => {
  let component: FinanceInfoTabComponent;
  let fixture: ComponentFixture<FinanceInfoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceInfoTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanceInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
