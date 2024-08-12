import { Component, OnInit } from '@angular/core';
import { SettingService } from 'app/service/setting.service';
import swal from 'sweetalert';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class AboutComponent implements OnInit {
  id = '0';

  setting = {
    pp: '',
    tnc: '',
    order: 1,
  };




  constructor(
    private service: SettingService,
    private toastr: ToastrService

  ) {
  }

  ngOnInit() {
    this.get_details();

  }

  

  trackByFn(index, data) {

    return index;
  }
  save() {

    console.log(this.setting);
    if (this.setting.pp != '' && this.setting.tnc != '') {

      this.service.add_aboutinfo(this.id, this.setting).subscribe(data => {

        if (data.status == 1) {

          this.toastr.success('Settings Updated.', 'Success', {
            positionClass: 'toast-bottom-right'
          });
          this.ngOnInit();

        } else {
          this.toastr.error(data.message, 'Error', {
            positionClass: 'toast-bottom-right'
          });
        }

      })
    } else {
      this.toastr.error('Some Fields are Empty', 'Fields Empty', {
        positionClass: 'toast-bottom-right'
      });

    }



  }

  get_details() {
    this.service.setting_list().subscribe(data2 => {
      console.log(data2, 'kk');
      if (data2.data == null) {
        //Iska  mtlb hmny yahan kuch nai karwana//
      } else {

        console.log(data2.data.pp,)
        this.id = data2.data._id;
        this.setting.pp = data2.data.pp;
        this.setting.tnc = data2.data.tnc;


       

      }


    })
  }

}
