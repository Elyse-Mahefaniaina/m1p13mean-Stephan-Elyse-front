import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { CanActiveService } from '../../services/canActive/can-active.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

export const canActivePageGuard: CanActivateFn = (route, state) => {
  const canActiveService = inject(CanActiveService);
  const toastService = inject(ToastService);
  const authservice = inject(AuthService);
  const router = inject(Router);
  const prefix = state.url.split('/')[1];
  
  return canActiveService.userCanActivePage(state.url).pipe(
    map((res :any) => {
      if (res.state === true) {
        return true;
      } else {
        toastService.show('Permission insuffissante', 'danger');
        authservice.logout().subscribe({});
        return router.parseUrl(`/${prefix}/login`);
      }
    }),
    catchError(err => {
      toastService.show('Permission insuffissante', 'danger');
      authservice.logout().subscribe({});
      return of(router.parseUrl(`/${prefix}/login`))
    })
  );
};
