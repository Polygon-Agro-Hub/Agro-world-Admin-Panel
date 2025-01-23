import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionCenterViewComplainComponent } from './collection-center-view-complain.component';

describe('CollectionCenterViewComplainComponent', () => {
  let component: CollectionCenterViewComplainComponent;
  let fixture: ComponentFixture<CollectionCenterViewComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionCenterViewComplainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionCenterViewComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
