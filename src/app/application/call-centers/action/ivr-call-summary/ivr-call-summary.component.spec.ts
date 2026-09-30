import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvrCallSummaryComponent } from './ivr-call-summary.component';

describe('IvrCallSummaryComponent', () => {
  let component: IvrCallSummaryComponent;
  let fixture: ComponentFixture<IvrCallSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IvrCallSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IvrCallSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
