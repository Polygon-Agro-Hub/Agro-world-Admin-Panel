import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionRequestsViewDocumentsComponent } from './pension-requests-view-documents.component';

describe('PensionRequestsViewDocumentsComponent', () => {
  let component: PensionRequestsViewDocumentsComponent;
  let fixture: ComponentFixture<PensionRequestsViewDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionRequestsViewDocumentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PensionRequestsViewDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
