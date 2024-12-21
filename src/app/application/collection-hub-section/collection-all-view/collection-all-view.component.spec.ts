import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionAllViewComponent } from './collection-all-view.component';

describe('CollectionAllViewComponent', () => {
  let component: CollectionAllViewComponent;
  let fixture: ComponentFixture<CollectionAllViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionAllViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionAllViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
