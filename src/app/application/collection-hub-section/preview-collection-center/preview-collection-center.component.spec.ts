import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewCollectionCenterComponent } from './preview-collection-center.component';

describe('PreviewCollectionCenterComponent', () => {
  let component: PreviewCollectionCenterComponent;
  let fixture: ComponentFixture<PreviewCollectionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewCollectionCenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewCollectionCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
