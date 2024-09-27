import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SteckholdersComponent } from './steckholders.component';

describe('SteckholdersComponent', () => {
  let component: SteckholdersComponent;
  let fixture: ComponentFixture<SteckholdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SteckholdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SteckholdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
