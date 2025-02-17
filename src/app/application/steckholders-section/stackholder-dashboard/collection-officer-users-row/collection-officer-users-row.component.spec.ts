import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionOfficerUsersRowComponent } from './collection-officer-users-row.component';

describe('CollectionOfficerUsersRowComponent', () => {
  let component: CollectionOfficerUsersRowComponent;
  let fixture: ComponentFixture<CollectionOfficerUsersRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionOfficerUsersRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionOfficerUsersRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
