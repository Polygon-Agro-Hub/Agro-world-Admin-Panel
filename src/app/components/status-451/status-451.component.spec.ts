import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Status451Component } from './status-451.component';

describe('Status451Component', () => {
  let component: Status451Component;
  let fixture: ComponentFixture<Status451Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Status451Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Status451Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
