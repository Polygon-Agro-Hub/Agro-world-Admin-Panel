import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCenterPriceComponent } from './view-center-price.component';

describe('ViewCenterPriceComponent', () => {
  let component: ViewCenterPriceComponent;
  let fixture: ComponentFixture<ViewCenterPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCenterPriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCenterPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
