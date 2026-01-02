import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectedComponent } from './collected.component';

describe('CollectedComponent', () => {
  let component: CollectedComponent;
  let fixture: ComponentFixture<CollectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
