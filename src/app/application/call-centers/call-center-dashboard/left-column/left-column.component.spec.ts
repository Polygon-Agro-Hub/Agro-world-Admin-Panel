import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftColumnComponent } from './left-column.component';

describe('LeftColumnComponent', () => {
  let component: LeftColumnComponent;
  let fixture: ComponentFixture<LeftColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
