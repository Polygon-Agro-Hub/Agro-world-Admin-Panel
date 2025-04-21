import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectVarietyListComponent } from './select-variety-list.component';

describe('SelectVarietyListComponent', () => {
  let component: SelectVarietyListComponent;
  let fixture: ComponentFixture<SelectVarietyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectVarietyListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectVarietyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
