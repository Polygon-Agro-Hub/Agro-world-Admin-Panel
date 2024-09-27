import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachToolsFixeedAssetsComponent } from './mach-tools-fixeed-assets.component';

describe('MachToolsFixeedAssetsComponent', () => {
  let component: MachToolsFixeedAssetsComponent;
  let fixture: ComponentFixture<MachToolsFixeedAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachToolsFixeedAssetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachToolsFixeedAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
