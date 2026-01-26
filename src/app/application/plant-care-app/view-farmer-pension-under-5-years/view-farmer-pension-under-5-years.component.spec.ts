import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFarmerPensionUnder5YearsComponent } from './view-farmer-pension-under-5-years.component';

describe('ViewFarmerPensionUnder5YearsComponent', () => {
  let component: ViewFarmerPensionUnder5YearsComponent;
  let fixture: ComponentFixture<ViewFarmerPensionUnder5YearsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFarmerPensionUnder5YearsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewFarmerPensionUnder5YearsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
