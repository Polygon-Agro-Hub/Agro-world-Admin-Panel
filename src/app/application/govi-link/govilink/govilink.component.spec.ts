import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovilinkComponent } from './govilink.component';

describe('GovilinkComponent', () => {
  let component: GovilinkComponent;
  let fixture: ComponentFixture<GovilinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovilinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovilinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
