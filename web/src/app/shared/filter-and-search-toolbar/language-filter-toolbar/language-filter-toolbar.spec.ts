import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SharedModule } from '../../shared-module';

import { LanguageFilterToolbar } from './language-filter-toolbar';

describe('LanguageFilterToolbar', () => {
  let component: LanguageFilterToolbar;
  let fixture: ComponentFixture<LanguageFilterToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageFilterToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
