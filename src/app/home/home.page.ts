import { Component, OnInit, ViewChild } from '@angular/core';
import { dropdownData, processedDataSharing } from './interfaces/dropdown.interface';
import { DatabaseService } from './services/data-base.service'
import { ModalController, IonRange } from '@ionic/angular';
import { AboutDeveloperComponent } from './about-developer/about-developer.component';
import { FilterPopOverComponent } from './filter-pop-over/filter-pop-over.component'
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { HowToUseComponent } from './how-to-use/how-to-use.component'
import { appSessionData } from './appSessionData.interface'
import { ThemeChangeService } from './services/theme-change.service'
import { SearchService } from './services/search.service'
import { SharingServiceService } from './services/sharing-service.service';
import { AppRateService } from './POCs/AppRate Service/app-rate.service';
import { Router } from '@angular/router';
import { wordToIdMap } from '../wordToId';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  appTitle: string = "Verboculary"
  isProcessed: boolean = false;


  selectedTheme: string = 'Default'
  //selectedWords: any; not maintaining here as lots of hassle in updating it
  allSetData: processedDataSharing;
  allSetOfcategory: any;
  allWordsOfSets;
  isDarkMode: boolean = false;
  chartLabelsAndData = {};


  prevDeltaX = 0;
  prevDeltaY = 0;

  @ViewChild('range', { static: false }) range : IonRange;

  constructor(public searchService: SearchService, public db: DatabaseService, public modalController: ModalController, public toastController: ToastController, public alertController: AlertController, private themeService: ThemeChangeService, public router: Router, public sharingService: SharingServiceService, public appRateService: AppRateService) {
    this.allSetData = this.db.allSetData;
    this.allWordsOfSets = this.allSetData.allWordOfSets;

  }
  ngOnInit() {


  }






  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Warning! Deleting all App Data?',
      message: 'Are You sure you want to reset all the app data? this will delete all the progress.',
      cssClass: 'ionicAlert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            this.db.presentToast("Deletion Cancelled!!");
          }
        }, {
          text: 'Reset',
          handler: () => {
            this.db.reSetApp();
          }
        }
      ]
    });

    await alert.present();
  }

  async presentDynamicAlert(data) {

    let header = data.header;
    let message = data.message;
    let buttons = data.buttons; // of the format of whatever I want;
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: buttons
    });

    await alert.present();
  }
  async presentRatingAlert() {
    const alert = await this.alertController.create({
      header: 'Rate Us',
      message: 'Would you mind rating us? it means a lot.',
      cssClass: 'alertstar',
      buttons: [
        {
          text: 'May be Later!',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.goToRatingSite();
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Take Me there',
          handler: () => {
            //this.db.reSetApp();
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

  changeAppTheme() {
    this.themeService.changeTheme(this.selectedTheme);

  }

  goToRatingSite() {
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: AboutDeveloperComponent
    });
    return await modal.present();
  }

  async presentHowToUseModal() {
    const modal = await this.modalController.create({
      component: HowToUseComponent
    });
    return await modal.present();
  }


  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  resetProgress() {

  }








  compareWithFn_category = (o1, o2) => {
    return o1 && o2 ? o1 === o2 : o1 === o2;
  };
  compareWithFn_set = (o1, o2) => {
    return o1 && o2 ? o1 === o2 : o1 === o2;
  };
  compareWith_category = this.compareWithFn_category;
  compareWith_set = this.compareWithFn_set;

  searchBarOnFocus = (event) => {

  }

  prev(){
    this.db.prev();
  }

  next(){
    this.db.next();
  }

  tooglePlayer(pause){
    this.db.tooglePlayer(pause);
  }

  seek(){
    this.db.seek(this.range);
  }

  close(){
    this.db.closePodcast();
  }
}
