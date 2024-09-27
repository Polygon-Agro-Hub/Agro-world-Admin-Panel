import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionOfficerReportViewComponent } from './collection-officer-report-view.component';

describe('CollectionOfficerReportViewComponent', () => {
  let component: CollectionOfficerReportViewComponent;
  let fixture: ComponentFixture<CollectionOfficerReportViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionOfficerReportViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionOfficerReportViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
