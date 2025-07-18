import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCenterHeadComponent } from './view-center-head.component';

describe('ViewCenterHeadComponent', () => {
  let component: ViewCenterHeadComponent;
  let fixture: ComponentFixture<ViewCenterHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCenterHeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCenterHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
