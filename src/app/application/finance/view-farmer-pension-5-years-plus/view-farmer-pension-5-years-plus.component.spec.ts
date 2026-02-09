import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFarmerPension5YearsPlusComponent } from './view-farmer-pension-5-years-plus.component';

describe('ViewFarmerPension5YearsPlusComponent', () => {
  let component: ViewFarmerPension5YearsPlusComponent;
  let fixture: ComponentFixture<ViewFarmerPension5YearsPlusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFarmerPension5YearsPlusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewFarmerPension5YearsPlusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
