import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandInfoTabComponent } from './land-info-tab.component';

describe('LandInfoTabComponent', () => {
  let component: LandInfoTabComponent;
  let fixture: ComponentFixture<LandInfoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandInfoTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
