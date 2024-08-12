import swal from 'sweetalert'
import { ToastrService } from 'ngx-toastr'
import { Component, OnInit } from '@angular/core'

import { SettingService } from 'app/service/setting.service'
import { environment } from 'environments/environment'
import { ApiService } from 'app/service/api.service'
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'notifications-cmp',
  moduleId: module.id,
  templateUrl: 'notifications.component.html',
  // styleUrls: [
  //   "../node_modules"
  // ],
})
export class NotificationsComponent {
  urllink = '';
  imgUpload = '';
  imageSource = '';
  notifForm = new FormGroup({
    title: new FormControl(''),
    body: new FormControl(''),
    user: new FormControl('All'),
    filter: new FormGroup({
      selectedGender: new FormControl('All'),
      from: new FormControl(0),
      to: new FormControl(0),
      exactAge: new FormControl(0),
      usersWithIncompleteSurveys: new FormControl(false)
    }),
    surveyStatus: new FormControl('1'),
  })
  notiflist: any = []
  url: any
  show_options2 = false
  filteredusers


  // filter=''

  data: any = []
  userList = []
  eventList = [];
  // date_range = {
  //   start_date: '',
  //   end_date: '',
  // }

  loading = true
  constructor(
    private service: ApiService,
    private toastr: ToastrService
  ) {
    this.getnotilist()
    this.url = environment.url
  }

  ngOnInit() {
  }

  getnotilist() {
    this.service.adminnotilist().subscribe((data) => {
      console.log(data)
      if (data.message == 'success') {
        this.notiflist = data.data
        this.loading = false
      }
    })
  }


  // search2(event: any) {
  //   // console.log('click happened')
  //   // console.log(event)

  //   this.show_options2 = true
  //   if (this.notif.attach == 'deal') {
  //     this.filteredusers = this.deallist
  //   }
  //   if (this.notif.attach == 'product') {
  //     this.filteredusers = this.productlist
  //   }
  //   // console.log(this.filteredusers)
  //   // this.noFilterUsers = false;

  //   const val = event.target.value
  //   if (val && val.trim() != '') {
  //     this.filteredusers = this.filteredusers.filter((item) => {
  //       return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1
  //     })
  //   }
  // }

  // select_owner2(id, name) {
  //   // console.log(id)
  //   // console.log(name)
  //   this.show_options2 = false
  //   this.notif.data = id
  //   // this.labtestdata.userId = id;
  //   this.notif.dataname = name
  //   // this.user_detail.id = id;
  // }



  close_add() {
    this.notifForm.reset({
      title: '',
      body: '',
      user: 'All',
      filter: {
        selectedGender: 'All',
        from: 0,
        to: 0,
        exactAge: 0,
      },
      surveyStatus: '1',
    })
  }

  createNotif() {
    console.log(this.notifForm.value)
    console.log('iam i')

    if (this.notifForm.valid) {
      // if (this.notifForm.value.user == 'User') {
        
      // }

      if (this.notifForm.get('filter').value.to > this.notifForm.get('filter').value.from ||  this.notifForm.get('filter').value.to == this.notifForm.get('filter').value.from ) {
        this.service.sendnoti(this.notifForm.value).subscribe((data) => {
          this.loading = false
          if (data.message == 'success') {
            this.toastr.success('Notification Sent Successfully', 'Success !', {
              positionClass: 'toast-bottom-right'
            });
            this.getnotilist()
            this.close_add()
          } else {
            this.toastr.error('Something went wrong..', 'Error !', {
              positionClass: 'toast-bottom-right'
            });
          }
        })
      } else {
        this.toastr.error('Ending age (to) cannot be more than starting age (from) ', 'Error', {
          positionClass: 'toast-bottom-right'
        })
      }
    } else {
      this.toastr.error('Form Invalid', 'Error', {
        positionClass: 'toast-bottom-right'
      })
    }

  }



  deletenotif(id) {
    swal('Are you sure, you want to delete it?', {
      buttons: {
        catch: {
          text: 'No',
          value: 'catch',
        },
        yes: true,
      },
    }).then((value) => {
      // console.log(value);
      if (value == 'yes') {
        // console.log('delete');
        // console.log(id);
        this.service.deleteNotif({_id:id}).subscribe((data) => {
          // console.log(data);

          if (data.messege !== 'success') {
            // console.log('question deleted');
            this.getnotilist()
            this.toastr.success('Notification deleted Successfully', 'Success !', {
              positionClass: 'toast-bottom-right'
            });
          } else {
            this.toastr.error('data.message', 'Error' , {
              positionClass: 'toast-bottom-right'
            })
          }
        })
      }
    })
  }

  valuechange(event, key) {
    if (key == 'from') {
      if (this.notifForm.get('filter').value.from != 0) {
        // this.notifForm.get('filter').value.from = 0;
        // this.notifForm.get('filter').value.to = 0;
        this.notifForm.get('filter').reset({
          selectedGender: this.notifForm.get('filter').value.selectedGender,
          from: this.notifForm.get('filter').value.from,
          to: this.notifForm.get('filter').value.to,
          exactAge: 0
        })

      }
    } else if (key == 'to') {
      if (this.notifForm.get('filter').value.exactAge != 0) {
        // this.notifForm.get('filter').value.from = 0;
        // this.notifForm.get('filter').value.to = 0;
        this.notifForm.get('filter').reset({
          selectedGender: this.notifForm.get('filter').value.selectedGender,
          from: this.notifForm.get('filter').value.from,
          to: this.notifForm.get('filter').value.to,
          exactAge: 0
        })

      }
    } else {

      if (this.notifForm.get('filter').value.exactAge != 0) {
        // this.notifForm.get('filter').value.from = 0;
        // this.notifForm.get('filter').value.to = 0;
        this.notifForm.get('filter').reset({
          selectedGender: this.notifForm.get('filter').value.selectedGender,
          from: 0,
          to: 0,
          exactAge: this.notifForm.get('filter').value.exactAge
        })

      }
    }

  }

  open() {
    console.log('kuch')
    // this.imageSrc = '../../../../assets/upload.png'
  }

  // updatenotif() {
  //   console.log(this.editNotif)
  //   if (this.editNotif._id !== '' && this.editNotif.name !== '') {
  //     this.loading = true
  //     console.log(this.editNotif)
  //     this.service.updateNotif(this.editNotif).subscribe((data) => {
  //       this.loading = false
  //       console.log(data)
  //       if (data.message == 'success') {
  //         this.close_add()
  //         this.notiflist = data.data
  //         swal('Success!', 'Notif has been updated successfully.')
  //       } else {
  //         swal('Failed!', 'Something went wrong..')
  //       }
  //     })
  //   } else {
  //     swal('Failed!', 'Fields are missing', 'info')
  //   }
  // }

  import() {

  }

  // exportAsXLSX(): void {
  //   // console.log(this.data);

  //   this._service.exportAsExcelFile(this.data, 'General_questionlist')
  // }

  // image upload

  selected_pic = null
  selected_image
  imageSrc: any = '../../../../assets/upload.png'
  selected_pic1 = null
  selected_image1
  imageSrc1: any = '../../../../assets/upload.png'

  pic_click() {
    console.log('clicking')
    let user = document.getElementById('inputGroupFile01')
    // console.log(user);
    user.click()
  }

  select_pic(event) {
    if (event && event.target.files.length > 0) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.urllink = event.target.result;
      };
      let ext
      ext = event.target.files[0].name.split(".")
      ext = ext[ext.length - 1]
      this.imgUpload = event.target.files[0];
      this.service.uploadImage(this.imgUpload).subscribe(res => {
        console.log(res, 'res');
        if (res['status'] == 1) {
          this.imageSource = res['imageName'];
          this.notifForm.value.image = res['imageName']

        }
        else {
          console.log('Error');
        }
      });
    }
  }


  pic_click1() {
    console.log('clicking123')
    let user = document.getElementById('inputGroupFile012')
    // console.log(user);
    user.click()
  }

  select_pic1(event) {
    // console.log(event)

    this.selected_pic1 = <File>event.target.files[0]
    this.selected_image1 = event.target.files[0].name

    var reader = new FileReader()
    reader.readAsDataURL(event.target.files[0])

    reader.onload = (data): any => {
      let src: any = reader.result
      this.imageSrc1 = src
    }

    const fd = new FormData()
    fd.append('file', this.selected_pic1, this.selected_pic1.name)

    this.service.uploadImage(fd).subscribe((data) => {
      console.log(data)
      if (data.success) {
        // this.notif.pathImage = data.docs
      }
    })
  }
}
