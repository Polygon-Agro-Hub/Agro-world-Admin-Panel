import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviTransFinanceComponent } from './govi-trans-finance.component';

describe('GoviTransFinanceComponent', () => {
  let component: GoviTransFinanceComponent;
  let fixture: ComponentFixture<GoviTransFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviTransFinanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviTransFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
