import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private editOptionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private deleteOptionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor() { }

   // Set editOption value and notify subscribers
   setEditOption(option: boolean) {
    this.editOptionSubject.next(option);
  }

  // Set deleteOption value and notify subscribers
  setDeleteOption(option: boolean) {
    this.deleteOptionSubject.next(option);
  }

  // Get the current value of editOption as an observable
  get editOption$() {
    return this.editOptionSubject.asObservable();
  }

  // Get the current value of deleteOption as an observable
  get deleteOption$() {
    return this.deleteOptionSubject.asObservable();
  }

 

}
