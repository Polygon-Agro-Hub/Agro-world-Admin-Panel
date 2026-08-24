import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSubmissionDocumentComponent } from './view-submission-document.component';

describe('ViewSubmissionDocumentComponent', () => {
  let component: ViewSubmissionDocumentComponent;
  let fixture: ComponentFixture<ViewSubmissionDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSubmissionDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSubmissionDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
