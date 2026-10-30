import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholesaleBuyerViewDocumentComponent } from './wholesale-buyer-view-document.component';

describe('WholesaleBuyerViewDocumentComponent', () => {
  let component: WholesaleBuyerViewDocumentComponent;
  let fixture: ComponentFixture<WholesaleBuyerViewDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholesaleBuyerViewDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholesaleBuyerViewDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
