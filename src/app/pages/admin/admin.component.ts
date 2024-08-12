import { Component, OnInit } from '@angular/core';
import { AdminService } from 'app/service/admin.service';
import swal from 'sweetalert';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  searchText = '';
  loader = false;
  admin = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    status: '1'
  };
  editadmindata = {
    _id: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    status: ''
  };
  error;
  fieldTextType: boolean;
  adminlist = [];
  noAdmin = false;
  rolelist = [];

  re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  emailVarifier = false;


  constructor(
    private service: AdminService,
    private toastr: ToastrService

  ) {
    this.getAllAdmin();
  }

  ngOnInit() { 
  }

  close_add() {
    this.admin.email = '';
    this.admin.password = '';
    this.admin.firstName = '';
    this.admin.lastName = ''; 
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  check() {
    if (!this.re.test(this.admin.email)) {
      // Invalid Email
      // console.log('invalid');
      this.emailVarifier = false;
    } else {
      // console.log('valid');
      this.emailVarifier = true;
    }
  }
  close() {
    this.admin.firstName = '';
    this.admin.email = '';
    this.admin.password = '';
    this.admin.lastName = '';
  }
  submitadmin() { 
    if (this.admin.email.trim() !== '' && this.admin.password.trim() !== ''
    ) {
      if (this.emailVarifier == true) {
        this.service.addAdmin(this.admin).subscribe(data => {
          if (data.status == 1) {
            this.close()
            this.toastr.success('Admin added successfully', 'Success !', {
              positionClass: 'toast-bottom-right'
            });
            this.getAllAdmin();

          }
          else {
            this.toastr.error(data.message, 'Error', {
              positionClass: 'toast-bottom-right'
            });
          }


        })

      } else {
        this.toastr.error('Please enter valid email address', 'Invalid email address', {
          positionClass: 'toast-bottom-right'
        });
      }

    }
    else {
      this.toastr.error('Please fill all the fields', 'Some feilds are empty', {
        positionClass: 'toast-bottom-right'
      });

    }

  }

  getAllAdmin() {
    this.loader = true
    this.service.adminList().subscribe(data => {
      this.loader = false
      if (data.status == 1) {

        this.adminlist = data.data
      }
    })
  }

  resetUpdate() {
    this.editadmindata.firstName = '';
    this.editadmindata.lastName = '';
    this.editadmindata.email = '';
    this.editadmindata.password = '';
    this.editadmindata._id = '';
  }

  deleteadmin(id) {
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


          this.service.updateAdmin(id, { status: '-1' }).subscribe(data => {
            if (data.status == 1) {
              this.toastr.success('Admin Deleted Successfully', 'Success !', {
                positionClass: 'toast-bottom-right'
              });
              this.getAllAdmin();

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

  editadmin(data) {

    this.editadmindata._id = data._id
    this.editadmindata.firstName = data.firstName
    this.editadmindata.lastName = data.lastName
    this.editadmindata.email = data.email;
    this.editadmindata.status = data.status;

  }

  updateadmin() {
    console.log(this.editadmindata);
    if (this.editadmindata.email.trim() !== '') {

      var da;
      if (this.editadmindata.password.trim() == '') {
        da = {
          firstName: this.editadmindata.firstName.trim(),
          lastName: this.editadmindata.lastName.trim(),
          status: this.editadmindata.status
        }

      } else {
        da = {
          firstName: this.editadmindata.firstName.trim(),
          lastName: this.editadmindata.lastName.trim(),
          password: this.editadmindata.password.trim(),
          status: this.editadmindata.status

        }
      }


      this.service.updateAdmin(this.editadmindata._id, da).subscribe(data => {
        // console.log(data)
        if (data.status == 1) {
          this.resetUpdate()
          this.toastr.success('Admin is updated', 'Success !', {
            positionClass: 'toast-bottom-right'
          });
          this.getAllAdmin();
        }
        else {
          this.toastr.error('', 'Something went wrong', {
            positionClass: 'toast-bottom-right'
          });
        }
      })
    } else {
      this.toastr.error('Please fill all the fields', 'Some feilds are empty', {
        positionClass: 'toast-bottom-right'
      });
    }
  }


}
