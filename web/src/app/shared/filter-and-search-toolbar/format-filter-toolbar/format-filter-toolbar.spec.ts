import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SharedModule } from '../../shared-module';

import { FormatFilterToolbar } from './format-filter-toolbar';

describe('FormatFilterToolbar', () => {
  let component: FormatFilterToolbar;
  let fixture: ComponentFixture<FormatFilterToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(FormatFilterToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
