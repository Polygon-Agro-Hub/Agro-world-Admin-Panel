import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPikupOdersComponent } from './all-pikup-oders.component';

describe('AllPikupOdersComponent', () => {
  let component: AllPikupOdersComponent;
  let fixture: ComponentFixture<AllPikupOdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPikupOdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllPikupOdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
