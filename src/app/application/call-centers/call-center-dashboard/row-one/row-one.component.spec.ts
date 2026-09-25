import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowOneComponent } from './row-one.component';

describe('RowOneComponent', () => {
  let component: RowOneComponent;
  let fixture: ComponentFixture<RowOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowOneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RowOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
