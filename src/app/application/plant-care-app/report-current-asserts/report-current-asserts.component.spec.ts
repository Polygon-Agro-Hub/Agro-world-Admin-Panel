import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCurrentAssertsComponent } from './report-current-asserts.component';

describe('ReportCurrentAssertsComponent', () => {
  let component: ReportCurrentAssertsComponent;
  let fixture: ComponentFixture<ReportCurrentAssertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCurrentAssertsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCurrentAssertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
