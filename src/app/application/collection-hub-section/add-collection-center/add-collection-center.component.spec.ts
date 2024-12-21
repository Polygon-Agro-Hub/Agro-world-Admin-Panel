import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollectionCenterComponent } from './add-collection-center.component';

describe('AddCollectionCenterComponent', () => {
  let component: AddCollectionCenterComponent;
  let fixture: ComponentFixture<AddCollectionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollectionCenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCollectionCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
