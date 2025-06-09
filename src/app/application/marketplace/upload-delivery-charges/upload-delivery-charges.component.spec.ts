import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDeliveryChargesComponent } from './upload-delivery-charges.component';

describe('UploadDeliveryChargesComponent', () => {
  let component: UploadDeliveryChargesComponent;
  let fixture: ComponentFixture<UploadDeliveryChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDeliveryChargesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadDeliveryChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
