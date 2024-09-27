import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgoPasswordComponent } from './forgo-password.component';

describe('ForgoPasswordComponent', () => {
  let component: ForgoPasswordComponent;
  let fixture: ComponentFixture<ForgoPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgoPasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ForgoPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
