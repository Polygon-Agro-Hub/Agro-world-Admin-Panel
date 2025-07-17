import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDestributionCenterComponent } from './view-destribution-center.component';

describe('ViewDestributionCenterComponent', () => {
  let component: ViewDestributionCenterComponent;
  let fixture: ComponentFixture<ViewDestributionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDestributionCenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDestributionCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
