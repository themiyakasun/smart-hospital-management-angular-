import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFilter } from './doctor-filter';

describe('DoctorFilter', () => {
  let component: DoctorFilter;
  let fixture: ComponentFixture<DoctorFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
