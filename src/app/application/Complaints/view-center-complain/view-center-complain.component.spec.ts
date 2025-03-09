import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCenterComplainComponent } from './view-center-complain.component';

describe('ViewCenterComplainComponent', () => {
  let component: ViewCenterComplainComponent;
  let fixture: ComponentFixture<ViewCenterComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCenterComplainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCenterComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
