import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddacompanyComponent } from './addacompany.component';

describe('AddacompanyComponent', () => {
  let component: AddacompanyComponent;
  let fixture: ComponentFixture<AddacompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddacompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddacompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
