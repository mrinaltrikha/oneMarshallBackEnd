import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  listOfAllRecords: Array<any>;
  recordBeingEdited: Object;
  recordBeingEdited_Id = null;

  modalViewForRecordDetails_Ref = null;
  modalViewForRecordDetails_IsOpenForAddNew = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.refreshList();
  }

  // Create
  createRecord() {
    this.http.post('api/member', this.recordBeingEdited).subscribe(data => {
      this.modalViewForRecordDetails_Ref.close();
      this.refreshList();
    });
  }

  // Retrieve All
  refreshList() {
    this.http.get('api/members').subscribe(data => {
      this.listOfAllRecords = data as Array<any>;
    });
  }

  // Update
  updateRecord() {
    this.http.put('api/member/' + this.recordBeingEdited_Id, this.recordBeingEdited).subscribe(data => {
      this.modalViewForRecordDetails_Ref.close();
      this.refreshList();
    });
  }

  // Delete
  deleteRecord(id) {
    this.http.delete('api/member/' + id).subscribe(data => {
      this.refreshList();
    })
  }

  // Open 'Add Record' Form
  showAddNewRecordForm(modal) {
    this.recordBeingEdited = {};
    this.modalViewForRecordDetails_Ref = this.modalService.open(modal);
    this.modalViewForRecordDetails_IsOpenForAddNew = true;
  }

  // Open 'Edit Record' Form
  showEditRecordForm(id, modal) {
    this.http.get('api/member/' + id).subscribe(data => {
      this.recordBeingEdited = data;
      this.recordBeingEdited_Id = id;
      this.modalViewForRecordDetails_Ref = this.modalService.open(modal);
      this.modalViewForRecordDetails_IsOpenForAddNew = false;
    });
  }
}
