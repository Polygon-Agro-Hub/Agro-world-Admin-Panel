import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCallLogsComponent } from './all-call-logs.component';

describe('AllCallLogsComponent', () => {
  let component: AllCallLogsComponent;
  let fixture: ComponentFixture<AllCallLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCallLogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllCallLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
