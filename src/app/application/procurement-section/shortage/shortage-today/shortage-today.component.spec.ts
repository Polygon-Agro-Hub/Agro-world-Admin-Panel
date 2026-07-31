import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortageTodayComponent } from './shortage-today.component';

describe('ShortageTodayComponent', () => {
  let component: ShortageTodayComponent;
  let fixture: ComponentFixture<ShortageTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortageTodayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShortageTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
