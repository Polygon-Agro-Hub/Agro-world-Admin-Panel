import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerListReportComponent } from './farmer-list-report.component';

describe('FarmerListReportComponent', () => {
  let component: FarmerListReportComponent;
  let fixture: ComponentFixture<FarmerListReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerListReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FarmerListReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
