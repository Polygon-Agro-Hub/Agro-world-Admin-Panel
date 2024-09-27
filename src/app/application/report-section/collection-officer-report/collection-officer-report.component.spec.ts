import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionOfficerReportComponent } from './collection-officer-report.component';

describe('CollectionOfficerReportComponent', () => {
  let component: CollectionOfficerReportComponent;
  let fixture: ComponentFixture<CollectionOfficerReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionOfficerReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionOfficerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
