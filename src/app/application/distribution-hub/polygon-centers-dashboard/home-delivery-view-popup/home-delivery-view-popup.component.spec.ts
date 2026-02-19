import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDeliveryViewPopupComponent } from './home-delivery-view-popup.component';

describe('HomeDeliveryViewPopupComponent', () => {
  let component: HomeDeliveryViewPopupComponent;
  let fixture: ComponentFixture<HomeDeliveryViewPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeDeliveryViewPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeDeliveryViewPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
