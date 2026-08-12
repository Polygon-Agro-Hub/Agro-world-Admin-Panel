import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortageFinalizationTodayComponent } from './shortage-finalization-today.component';

describe('ShortageFinalizationTodayComponent', () => {
  let component: ShortageFinalizationTodayComponent;
  let fixture: ComponentFixture<ShortageFinalizationTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortageFinalizationTodayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShortageFinalizationTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
