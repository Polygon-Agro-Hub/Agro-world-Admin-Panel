import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardWBuyersComponent } from './onboard-w-buyers.component';

describe('OnboardWBuyersComponent', () => {
  let component: OnboardWBuyersComponent;
  let fixture: ComponentFixture<OnboardWBuyersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardWBuyersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnboardWBuyersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
