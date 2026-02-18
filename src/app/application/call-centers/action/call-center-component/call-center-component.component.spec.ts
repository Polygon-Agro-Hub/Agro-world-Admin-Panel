import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallCenterComponentComponent } from './call-center-component.component';

describe('CallCenterComponentComponent', () => {
  let component: CallCenterComponentComponent;
  let fixture: ComponentFixture<CallCenterComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallCenterComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallCenterComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
