import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _toast: ToastController
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._check();
  }

  private _check(): Observable<boolean> {
    return this._auth.authCheck()
      .pipe(
        switchMap(authenticated => {
          if (!authenticated) {
            this._auth.keluar();
            this._router.navigate(['masuk']);
            return of(false);
          }
          return of(true);
        }),
      );
  }
}

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {
  constructor(
    private _auth: AuthService,
    private _router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._check();
  }

  private _check(): Observable<boolean> {
    return this._auth.nonAuthCheck() // harus e ga usah cek karna mengakibatkan error 500 user tidak ditemukan.. bikin cek sendiri
      .pipe(
        switchMap(authenticated => {
          if (authenticated) {
            this._router.navigate(['/']);
            return of(false);
          }
          return of(true);
        }),
      );
  }
}

@Injectable({
  providedIn: 'root'
})
export class FormGuard implements CanActivate {
  constructor(
    private _user: UserService,
    private _navCtrl: NavController,
    private _toast: ToastController
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let user = this._user.user;
    if (!user?.noPegawai || !user?.noTlp || !user?.fungsi || !user?.jabatan) {
      this._navCtrl.navigateForward(['/biodata'], { queryParams: { redirect: state.url } }).finally(async () => {
        let toast = await this._toast.create({
          message: 'Lengkapi biodata anda terlebih dahulu',
          duration: 3000,
          buttons: [{ icon: 'close' }],
          mode: 'ios',
          color: 'medium'
        })
        toast.present();
      })
      return of(false);
    } else {
      return of(true);
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private _user: UserService,
    private _router: Router,
    private _toast: ToastController
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let user = this._user.user;
    if (!user?.admin) {
      this._router.navigate(['/'], { queryParams: { redirect: state.url } }).finally(async () => {
        let toast = await this._toast.create({
          message: 'Anda tidak memiliki akses halaman ini.',
          duration: 3000,
          buttons: [{ icon: 'close' }],
          mode: 'ios',
          color: 'medium'
        })
        toast.present();
      })
      return of(false);
    } else {
      return of(true);
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class PenandatanganGuard implements CanActivate {
  constructor(
    private _user: UserService,
    private _router: Router,
    private _toast: ToastController
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let user = this._user.user;
    if (!user?.atasan && !user.penyetuju) {
      this._router.navigate(['/'], { queryParams: { redirect: state.url } }).finally(async () => {
        let toast = await this._toast.create({
          message: 'Anda tidak memiliki akses halaman ini.',
          duration: 3000,
          buttons: [{ icon: 'close' }],
          mode: 'ios',
          color: 'medium'
        })
        toast.present();
      })
      return of(false);
    } else {
      return of(true);
    }
  }
}
