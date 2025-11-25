import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicapitalFinanceComponent } from './govicapital-finance.component';

describe('GovicapitalFinanceComponent', () => {
  let component: GovicapitalFinanceComponent;
  let fixture: ComponentFixture<GovicapitalFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicapitalFinanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicapitalFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
