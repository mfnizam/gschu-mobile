import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError, from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from 'app/services/auth/auth.service';
import { AuthUtils } from 'app/services/auth/auth.utils';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private _auth: AuthService,
    private _toast: ToastController,
    private _navCtrl: NavController,
    ){}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this._auth.getAccessToken())
    .pipe(switchMap(accessToken => {
      let newReq = req.clone();
      if(accessToken && !AuthUtils.isTokenExpired(accessToken)) {
        newReq = req.clone({
          headers: req.headers.set('Authorization', 'JWT ' + accessToken)
        });
      }
      
      return next.handle(newReq)
      .pipe(
        catchError((response) => {
          if(response instanceof HttpErrorResponse && response.status === 401) {
            // this._auth.keluar().subscribe();
            // console.log(response)
            let auth = this._auth._authenticated
            this._auth.keluar();
            if(this.router.url == '/privasi') return;
            this._navCtrl.navigateRoot(['/masuk'], { animationDirection: 'forward' }).then(async res => {
              if(auth) {
                let toast = await this._toast.create({
                  message: 'Sesi anda telah habis',
                  duration: 3000,
                  buttons: [{ icon: 'close' }],
                  mode: 'ios',
                  color: 'medium'
                });
                toast.present();
              }
            })
            
            // this._alert.create({
            //   header: 'Akses Ditolak',
            //   message: 'Anda tidak memiliki akses pada halaman ini. Mohon masuk kembali.',
            //   mode: 'ios',
            //   cssClass: 'alert-danger',
            //   buttons: [{ text: 'Tutup', role: 'cancel'}]
            // }).then(v => {
            //   v.present();
            //   v.onDidDismiss().then(v => {
            //     this._navCtrl.navigateRoot(['/masuk'], { animationDirection: 'forward' })
            //   })
            // })
          }
          return throwError(response);
        })
        );
    }))
    
  }
}
