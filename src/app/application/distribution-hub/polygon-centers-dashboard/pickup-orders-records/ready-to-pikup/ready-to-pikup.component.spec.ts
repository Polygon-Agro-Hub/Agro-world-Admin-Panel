import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadyToPikupComponent } from './ready-to-pikup.component';

describe('ReadyToPikupComponent', () => {
  let component: ReadyToPikupComponent;
  let fixture: ComponentFixture<ReadyToPikupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadyToPikupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReadyToPikupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
