import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveofficersEditComponent } from './collectiveofficers-edit.component';

describe('CollectiveofficersEditComponent', () => {
  let component: CollectiveofficersEditComponent;
  let fixture: ComponentFixture<CollectiveofficersEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectiveofficersEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectiveofficersEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
