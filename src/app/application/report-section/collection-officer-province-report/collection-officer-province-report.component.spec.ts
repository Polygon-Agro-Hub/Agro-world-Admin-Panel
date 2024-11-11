import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionOfficerProvinceReportComponent } from './collection-officer-province-report.component';

describe('CollectionOfficerProvinceReportComponent', () => {
  let component: CollectionOfficerProvinceReportComponent;
  let fixture: ComponentFixture<CollectionOfficerProvinceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionOfficerProvinceReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionOfficerProvinceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
