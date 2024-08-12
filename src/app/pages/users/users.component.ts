import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AgmCoreModule } from '@agm/core';
import { ApiService } from 'app/service/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { countrycodes } from 'app/shared/countrycodes';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent implements OnInit {


  imgUpload = "";
  imageSource = null;
  searchText = '';
  urllink: String;
  loader = false

  userForm = new FormGroup({
    _id: new FormControl(null),
    name: new FormControl(''),
    email: new FormControl('', Validators.required),
    gender: new FormControl('Male'),
    age: new FormControl(Validators.required),
    address: new FormControl(''),
    image: new FormControl(''),
    phoneCode: new FormControl('+92', Validators.required),
    phone: new FormControl('', Validators.required),
    status: new FormControl('1'),
  })

  fieldTextType: boolean;
  userList = [];
  rolelist = [];
  countryCodes: { name: string; dial_code: string; code: string; }[];

  constructor(
    private service: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.getAlluserForm();
    this.countryCodes = countrycodes
  }



  getAlluserForm() {
    this.loader = true
    this.service.userList().subscribe(data => {
      this.loader = false
      if (data.status == 1) {
        this.userList = data.data;
      }
    })
  }

  getImage(event) {
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
        if (res['status'] == 1) {
          this.imageSource = res['imageName'];
          this.userForm.value.image = res['imageName']
        }
        else {
          console.log('Error');
        }
      });
    }
  }
  close() {
    this.userForm.reset({
      '_id': null,
      'name': '',
      'email': '',
      'gender': 'Male',
      'age': null,
      'address': '',
      'image': '',
      'phoneCode': '+92',
      'phone': '',
      'status': '1'
    })
  }

  editUser(data) {
    this.userForm.patchValue({
      '_id': data._id,
      'name': data.name,
      'email': data.email,
      'gender': data.gender,
      'age': data.age,
      'address': data.address,
      'image': data.image,
      'phoneCode': data.phoneCode,
      'phone': data.phone,
      'status': data.status,
    })

  }

  submitUser() {
    if (this.userForm.value._id != null) {
      this.updateUser()
    } else {
      this.addUser()
    }
  }

  addUser() {
    if (this.userForm.valid) {
      if (this.userForm.value.phone[0] == '0') {
        this.userForm.value.phone = this.userForm.value.phone.slice(1)
      }
      this.service.addUser(this.userForm.value).subscribe(data => {
        if (data.status == 1) {
          document.getElementById('close').click()
          this.getAlluserForm();
          this.close()
          this.toastr.success('User added successfully', 'Success !', {
            positionClass: 'toast-bottom-right'
          });
        }
        else {
          this.toastr.error(data.message, 'Error', {
            positionClass: 'toast-bottom-right'
          });
        }
      })
    }
    else {
      this.toastr.error('Form Invalid', 'Error', {
        positionClass: 'toast-bottom-right'
      });

    }
  }

  updateUser() {
    if (
      this.userForm.valid
    ) {
      if (this.userForm.value.phone[0] == '0') {
        this.userForm.value.phone = this.userForm.value.phone.slice(1)
      }


      this.service.updateUser(this.userForm.value._id, { firstName: this.userForm.value.name, ...this.userForm.value }).subscribe(data => {
        console.log(data)
        if (data.status == 1) {
          document.getElementById('close').click()
          this.getAlluserForm();
          this.close()
          this.toastr.success('User updated.', 'Success!', {
            positionClass: 'toast-bottom-right'
          });
        }
        else {
          this.toastr.error(data.message, 'Error', {
            positionClass: 'toast-bottom-right'
          });
        }
      })
    } else {
      this.toastr.error('Form Invalid', 'Error', {
        positionClass: 'toast-bottom-right'
      });
    }
  }


  deleteUser(id) {
    swal("Are you sure, you want to delete it?", {

      buttons: {

        catch: {
          text: "No",
          value: "catch",
        },
        yes: true
      },
    })
      .then((value) => {
        if (value == 'yes') {
          this.service.updateUser(id, { status: '-1' }).subscribe(data => {
            if (data.status == 1) {
              this.getAlluserForm();
              this.toastr.success('User deleted successfully', 'Success !', {
                positionClass: 'toast-bottom-right'
              });
            }
            else {
              this.toastr.error('', 'Something Went Wrong', {
                positionClass: 'toast-bottom-right'
              });
            }
          })
        }
      });
  }


  downloadUser(id) {
    this.service.download(id).subscribe(res => {
      console.log(res)
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'user.xlsx';
      link.click();

    }, (error) => {
      this.toastr.error(error, 'Error', {
        positionClass: 'toast-bottom-right'
      });
    })

  }

}
