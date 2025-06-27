import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSendToDispatchComponent } from './view-send-to-dispatch.component';

describe('ViewSendToDispatchComponent', () => {
  let component: ViewSendToDispatchComponent;
  let fixture: ComponentFixture<ViewSendToDispatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSendToDispatchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSendToDispatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
