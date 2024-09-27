import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMarketPriceComponent } from './create-market-price.component';

describe('CreateMarketPriceComponent', () => {
  let component: CreateMarketPriceComponent;
  let fixture: ComponentFixture<CreateMarketPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMarketPriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateMarketPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
