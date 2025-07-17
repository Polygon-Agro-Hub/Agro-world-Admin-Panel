import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCurrentCenterTargetComponent } from './view-current-center-target.component';

describe('ViewCurrentCenterTargetComponent', () => {
  let component: ViewCurrentCenterTargetComponent;
  let fixture: ComponentFixture<ViewCurrentCenterTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCurrentCenterTargetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCurrentCenterTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
