import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionofficerDistrictReportComponent } from './collectionofficer-district-report.component';

describe('CollectionofficerDistrictReportComponent', () => {
  let component: CollectionofficerDistrictReportComponent;
  let fixture: ComponentFixture<CollectionofficerDistrictReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionofficerDistrictReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionofficerDistrictReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
