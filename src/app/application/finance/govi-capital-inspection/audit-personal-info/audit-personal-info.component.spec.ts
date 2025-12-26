import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditPersonalInfoComponent } from './audit-personal-info.component';

describe('AuditPersonalInfoComponent', () => {
  let component: AuditPersonalInfoComponent;
  let fixture: ComponentFixture<AuditPersonalInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditPersonalInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditPersonalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
