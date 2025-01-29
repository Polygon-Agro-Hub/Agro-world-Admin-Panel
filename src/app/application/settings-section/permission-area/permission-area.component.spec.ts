import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionAreaComponent } from './permission-area.component';

describe('PermissionAreaComponent', () => {
  let component: PermissionAreaComponent;
  let fixture: ComponentFixture<PermissionAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermissionAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
