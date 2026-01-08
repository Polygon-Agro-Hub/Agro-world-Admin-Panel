import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PikupOdersComponent } from './pikup-oders.component';

describe('PikupOdersComponent', () => {
  let component: PikupOdersComponent;
  let fixture: ComponentFixture<PikupOdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PikupOdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PikupOdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
