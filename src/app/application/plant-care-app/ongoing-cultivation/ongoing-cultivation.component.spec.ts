import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngoingCultivationComponent } from './ongoing-cultivation.component';

describe('OngoingCultivationComponent', () => {
  let component: OngoingCultivationComponent;
  let fixture: ComponentFixture<OngoingCultivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OngoingCultivationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OngoingCultivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
