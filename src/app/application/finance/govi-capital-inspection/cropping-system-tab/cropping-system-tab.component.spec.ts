import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CroppingSystemTabComponent } from './cropping-system-tab.component';

describe('CroppingSystemTabComponent', () => {
  let component: CroppingSystemTabComponent;
  let fixture: ComponentFixture<CroppingSystemTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CroppingSystemTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CroppingSystemTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
