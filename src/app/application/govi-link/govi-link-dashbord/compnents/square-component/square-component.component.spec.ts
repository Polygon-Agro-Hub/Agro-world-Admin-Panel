import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareComponentComponent } from './square-component.component';

describe('SquareComponentComponent', () => {
  let component: SquareComponentComponent;
  let fixture: ComponentFixture<SquareComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SquareComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SquareComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
