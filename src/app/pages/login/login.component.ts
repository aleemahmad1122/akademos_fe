import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from 'app/service/login.service';
import { Router } from '@angular/router';
import { SettingService } from 'app/service/setting.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  url = environment.url;

  myForm: FormGroup;
  myForm1: FormGroup;
  myForm2: FormGroup;

  error = '';
  error1 = '';
  error2 = '';
  error3 = '';
  userid: any = 0;
  code;
  confrimpassword;
  password = '';

  fieldTextType: boolean;

  img: any;
  no_forget = true;
  email = false;
  fcm = true;

  setting_data = [];


  constructor(
    private service: LoginService,
    private _router: Router,
    private _service: SettingService,
    private toastr: ToastrService
  ) {
    // this.get_logo();
  }
  loader = false;
  ngOnInit() {
    this.myForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required)
    }),
      this.myForm1 = new FormGroup({
        'email': new FormControl(null, [Validators.required, Validators.email]),
      }),
      this.myForm2 = new FormGroup({
        'code': new FormControl(null, Validators.required)
      })

  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
  // checkLoader() {
  //   this.loader = true
  // }
  onSubmit() {

    if (this.myForm.valid == true && this.myForm.value.password.trim() !== '') {
      this.loader = true;

      this.myForm.value.password = this.myForm.value.password.trim();
      this.myForm.value.email = this.myForm.value.email.trim();
      console.log(this.myForm.value);


      this.service.checkuser(this.myForm.value).subscribe(data => {
        console.log(data);
        this.loader = false;

        if (data.status == 1) {
          //  localStorage.setItem('perm' , JSON.stringify(data.role));
          localStorage.setItem('token', data.jwt);
          console.log(localStorage.setItem('admin', JSON.stringify(data.data))

          );

          this._router.navigate(['/dashboard'])
          this.toastr.success('', data.message, {
            positionClass: 'toast-bottom-right'
          });
        }

        else {
          this.toastr.error('', data.message, {
            positionClass: 'toast-bottom-right'
          });
        }
      })
    }
    else {
      this.toastr.error('', 'Please Fill all the credentials', {
        positionClass: 'toast-bottom-right'
      });
    }
  }

  onSubmit1() {
    if (this.myForm1.valid == true) {
      this.service.checkemail(this.myForm1.value).subscribe(data => {
        if (data.message === 'success') {
          this.email = true;
          this.userid = data['id'];
          this.code = data['code'];

        }
        else if (data.message == 'failed') {
          this.error1 = 'Your email are not Correct'
        }
        else {
          this.error1 = 'Your email are not Correct';
        }
      })
    }
    else {
      this.error1 = 'Fill all the credentials';
    }
  }

  onSubmit2() {

    if (this.myForm2.value['code'] == this.code) {
      this.fcm = false
    } else {
      this.error2 = 'Code Not Match';
    }
  }

  // Password() {
  //   if (this.confrimpassword != '' && this.password != '') {
  //     if (this.confrimpassword == this.password) {
  //       console.log(this.password)

  //       this.service.changepassword(this.userid, this.password).subscribe(data => {
  //         if (data.message === 'success') {
  //           this.no_forget = true;
  //           this.email = false;
  //           this.fcm = true;
  //         }
  //         else if (data.message == 'failed') {
  //           this.error1 = 'Your Pasword are not update'
  //         }
  //       })
  //     }
  //     else {
  //       this.error3 = 'Password Not Match';
  //     }

  //   }
  //   else {
  //     this.error3 = 'Fill all the credentials';
  //   }

  // }

  // forget() {
  //   console.log('in it');
  //   this.no_forget = false;

  // }

  // get_logo(){
  //   this._service.setting_list().subscribe(data => {
  //     // console.log(data);
  //     this.setting_data = data;
  //     if (data.length >0){
  //       if (data[0].logo == null || data[0].logo == ''){
  //         this.no_logo = true;
  //       }else{

  //         this.img = this.url +'/'+ data[0].logo;

  //         // console.log('i m here');
  //         this.no_logo = false
  //       }
  //     }else{
  //       this.no_logo = true;
  //     }

  //   })
  //     }

}
