import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-redeption-items',
  templateUrl: './redeption-items.component.html',
  styleUrls: ['./redeption-items.component.css']
})
export class RedeptionItemsComponent implements OnInit {

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
    this.http.post('api/redemptionItem', this.recordBeingEdited).subscribe(data => {
      this.modalViewForRecordDetails_Ref.close();
      this.refreshList();
    });
  }

  // Retrieve All
  refreshList() {
    this.http.get('api/redemptionItems').subscribe(data => {
      this.listOfAllRecords = data as Array<any>;
    });
  }

  // Update
  updateRecord() {
    this.http.put('api/redemptionItem/' + this.recordBeingEdited_Id, this.recordBeingEdited).subscribe(data => {
      this.modalViewForRecordDetails_Ref.close();
      this.refreshList();
    });
  }

  // Delete
  deleteRecord(id) {
    this.http.delete('api/redemptionItem/' + id).subscribe(data => {
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
    this.http.get('api/redemptionItem/' + id).subscribe(data => {
      this.recordBeingEdited = data;
      this.recordBeingEdited_Id = id;
      this.modalViewForRecordDetails_Ref = this.modalService.open(modal);
      this.modalViewForRecordDetails_IsOpenForAddNew = false;
    });
  }

  onFileChange(event) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.recordBeingEdited['displayImage'] = {
          filename: file.name,
          filetype: file.type,
          value: reader.result
        };
      };
    }
  }
}
