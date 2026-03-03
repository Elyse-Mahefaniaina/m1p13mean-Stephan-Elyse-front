import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { canActivePageGuard } from './can-active-page-guard';

describe('canActivePageGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => canActivePageGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
