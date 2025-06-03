import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsriptionComponent } from './subsription.component';

describe('SubsriptionComponent', () => {
  let component: SubsriptionComponent;
  let fixture: ComponentFixture<SubsriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsriptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubsriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
