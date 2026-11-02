import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalBuyerValueComponent } from './total-buyer-value.component';

describe('TotalBuyerValueComponent', () => {
  let component: TotalBuyerValueComponent;
  let fixture: ComponentFixture<TotalBuyerValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalBuyerValueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalBuyerValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
