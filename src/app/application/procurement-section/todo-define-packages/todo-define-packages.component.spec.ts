import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoDefinePackagesComponent } from './todo-define-packages.component';

describe('TodoDefinePackagesComponent', () => {
  let component: TodoDefinePackagesComponent;
  let fixture: ComponentFixture<TodoDefinePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoDefinePackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodoDefinePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
