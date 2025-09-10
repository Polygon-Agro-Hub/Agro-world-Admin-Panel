import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExpencesFarmerReportComponent } from './view-expences-farmer-report.component';

describe('ViewExpencesFarmerReportComponent', () => {
  let component: ViewExpencesFarmerReportComponent;
  let fixture: ComponentFixture<ViewExpencesFarmerReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewExpencesFarmerReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewExpencesFarmerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
