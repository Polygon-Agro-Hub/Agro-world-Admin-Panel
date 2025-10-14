import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicarePackagesMainComponent } from './govicare-packages-main.component';

describe('GovicarePackagesMainComponent', () => {
  let component: GovicarePackagesMainComponent;
  let fixture: ComponentFixture<GovicarePackagesMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicarePackagesMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicarePackagesMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
