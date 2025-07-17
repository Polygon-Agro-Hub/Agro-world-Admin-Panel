import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholesaleComplaintsComponent } from './wholesale-complaints.component';

describe('wholesaleComplaintsComponent', () => {
  let component: WholesaleComplaintsComponent
  let fixture: ComponentFixture<WholesaleComplaintsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholesaleComplaintsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholesaleComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
