import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDriverComplaintsComponent } from './view-driver-complaints.component';

describe('ViewDriverComplaintsComponent', () => {
  let component: ViewDriverComplaintsComponent;
  let fixture: ComponentFixture<ViewDriverComplaintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDriverComplaintsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDriverComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
