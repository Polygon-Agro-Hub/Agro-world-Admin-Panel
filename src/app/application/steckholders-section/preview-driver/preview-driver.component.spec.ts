import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDriverComponent } from './preview-driver.component';

describe('PreviewDriverComponent', () => {
  let component: PreviewDriverComponent;
  let fixture: ComponentFixture<PreviewDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewDriverComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
