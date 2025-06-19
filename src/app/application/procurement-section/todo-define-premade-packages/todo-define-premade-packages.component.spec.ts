import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoDefinePremadePackagesComponent } from './todo-define-premade-packages.component';

describe('TodoDefinePremadePackagesComponent', () => {
  let component: TodoDefinePremadePackagesComponent;
  let fixture: ComponentFixture<TodoDefinePremadePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoDefinePremadePackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodoDefinePremadePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
