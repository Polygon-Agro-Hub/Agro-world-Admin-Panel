import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviShopFinanceComponent } from './govi-shop-finance.component';

describe('GoviShopFinanceComponent', () => {
  let component: GoviShopFinanceComponent;
  let fixture: ComponentFixture<GoviShopFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviShopFinanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviShopFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
