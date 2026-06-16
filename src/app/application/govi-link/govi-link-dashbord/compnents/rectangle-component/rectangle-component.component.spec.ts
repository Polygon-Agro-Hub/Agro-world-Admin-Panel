import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RectangleComponentComponent } from './rectangle-component.component';

describe('RectangleComponentComponent', () => {
  let component: RectangleComponentComponent;
  let fixture: ComponentFixture<RectangleComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RectangleComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RectangleComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
