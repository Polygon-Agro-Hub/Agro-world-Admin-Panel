import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPlaceActionsComponent } from './market-place-actions.component';

describe('MarketPlaceActionsComponent', () => {
  let component: MarketPlaceActionsComponent;
  let fixture: ComponentFixture<MarketPlaceActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketPlaceActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketPlaceActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
