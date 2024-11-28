import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCollectionCenterComponent } from './edit-collection-center.component';

describe('EditCollectionCenterComponent', () => {
  let component: EditCollectionCenterComponent;
  let fixture: ComponentFixture<EditCollectionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCollectionCenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCollectionCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
