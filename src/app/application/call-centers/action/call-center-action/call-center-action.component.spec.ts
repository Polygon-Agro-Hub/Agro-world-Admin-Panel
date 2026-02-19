import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallCenterActionComponent } from './call-center-action.component';

describe('CallCenterActionComponent', () => {
  let component: CallCenterActionComponent;
  let fixture: ComponentFixture<CallCenterActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallCenterActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallCenterActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
