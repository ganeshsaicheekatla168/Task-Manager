import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TaskService } from '../../services/tasks/task.service';
import { UserService } from '../../services/users/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Router } from '@angular/router';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-create-task',
  imports: [FormsModule, CommonModule,
    ButtonModule,
    DropdownModule,        // PrimeNG input text
    SelectModule,           // PrimeNG dropdown
    RadioButtonModule,      // PrimeNG radio buttons
    CheckboxModule,            // PrimeNG button
    DatePickerModule,
    ReactiveFormsModule,
    InputTextModule,
    ToastModule,
    AutoCompleteModule,
    MultiSelect,
    MultiSelectModule
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss',
  providers: [MessageService]
})
export class CreateTaskComponent implements OnInit {

  // Initialize formData with default values for both create and edit
  formDefaults = {
    _id: '',
    title: '',
    description: '',
    assignedToUserId: [],
    dueDate: '',
    priority: '',
    status: 'pending',
    isRead: false
  };

  today: Date = new Date();
  selectedPriority: string = '';
  selectedStatus: string = '';
  //pagination variable
  formData!: FormGroup;

  debounceTimeout: any;
  searchUser!: string;


  isLoadingUsers: boolean = false;
  allUsersLoaded: boolean = false;
  lastLazyLoadTime: number = 0;


  // A list of users for the dropdown
  users: { first_name: string, _id: string }[] = [];

  // Priority options for the dropdown
  priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ];
  priorityOptionsToFilter = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Filter By Priority', value: '' }  // Option to clear the filter
  ];

  // Status options for the dropdown
  statusOptions = [
    { label: 'In-progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Filter By Status', value: '' }  // Option to clear the filter
  ];

  constructor(private taskService: TaskService, private fb: FormBuilder, private messageService: MessageService, private userService: UserService, private router: Router) {

  }

  async ngOnInit() {
    // Initialize formData with FormBuilder
    this.formData = this.fb.group({
      _id: [''],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      assignedToUserId: [[], Validators.required],
      description: ['', [Validators.maxLength(100)]],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['pending'],  // Default to 'pending'
      isRead: [false]
    });
    this.loadUserList('0', 10, this.searchUser);
  }

  confirmCreateTask() {
    console.log(this.formData.value);
    if (!this.formData.invalid) {

      this.taskService.onTaskCreate(this.formData.value).subscribe({
        next: (responseData) => {
          console.log(responseData.success);
          //clear form data
          this.clearCreatingTaskDataForm();
          this.showMessage();
        },
        error: (error) => {

          if (error.status === 401) {
            this.showSessionExpired();
          } else {
            console.log("creation error");
            console.log(error.error.error);
            this.showError(`${error.error.error} Please try again.`);
          }
        },

      });
    }
    else {
      this.showError("Please fill required fields(*).")
    }
  }
  //used in form control
  clearCreatingTaskDataForm() {
    this.formData.reset();
    this.formData.get('status')?.setValue('pending');
  }

  async loadUserList(first: string, limit: number, searchUser: string) {
    this.lastLazyLoadTime = Date.now();
    this.userService.getAllUsersNamesAndIdsBySearch(first, limit, searchUser).subscribe({
      next: (response) => {
        if (first === "0") {
          this.users = response.data;
        }
        else {

          this.users = [...this.users, ...response.data];
        }
        // this.users = response.data;

        if (response.data.length < limit) {
          this.allUsersLoaded = true;
        }

        console.log(this.users)
      },
      error: (error) => {
        if (error.status === 401) {
          this.showSessionExpired();
        }
        else {
          console.error('Error fetching users:', error);
          this.showError('Error fetching users:' + error);
        }
      }
    })
  }

  async onUserSearch(event: any) {
    this.searchUser = event.filter;
    this.lastLazyLoadTime = Date.now();
    if (this.searchUser.length > 2) {


      this.isLoadingUsers = true;
      // Clear the previous timeout if it exists

      clearTimeout(this.debounceTimeout);
      // Set a new timeout to delay the function call
      this.debounceTimeout = setTimeout(async () => {
        this.users = []
        this.allUsersLoaded = false;
        await this.loadUserList('0', 10, this.searchUser);

        if (this.users.length === 0) {
          this.users = [{ first_name: 'No users found', _id: '' }];
        }
      }, 300); // Adjust 300ms to your desired delay
    }
    else if (this.searchUser.length === 0) {
      this.isLoadingUsers = true;
      this.allUsersLoaded = false;
      await this.loadUserList('0', 10, this.searchUser);
    }
    this.isLoadingUsers = false;

  }
  async onScrollEnd(event: any) {

    const now = Date.now();
    if (now - this.lastLazyLoadTime < 500 || this.allUsersLoaded || this.isLoadingUsers || event.first === 0) {
      return;
    }


    this.lastLazyLoadTime = now;
    const newStart = this.users.length;
    await this.loadUserList(newStart.toString(), 10, this.searchUser);
  }


  showMessage() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Task Created Successfully',
      life: 1000
    });
    setTimeout(() => {
      this.router.navigate(['/home/viewTasks']);
    }, 1000);

  }

  // Method to trigger a failure (error) toast message
  showError(message: string) {
    this.messageService.add({
      severity: 'error',  // Changed to 'error' for failure messages
      summary: 'Failed',
      detail: `${message}`,
      life: 1000  // Message will disappear after 4 seconds
    });
  }

  showSessionExpired() {
    this.messageService.add({
      severity: 'warn',  // Changed to 'error' for failure messages
      summary: 'Session Expired.',
      detail: `Please Login Again`,
      life: 1000  // Message will disappear after 4 seconds
    });
    setTimeout(() => {
      this.userService.clearUserData();
      this.router.navigate(['/login']);
      window.location.reload();
    }, 1000);
  }

}
