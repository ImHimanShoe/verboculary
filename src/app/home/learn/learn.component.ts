import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { DatabaseService } from '../services/data-base.service';
import { SharingServiceService } from '../services/sharing-service.service'
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { wordToIdMap } from '../../wordToId'
import { Router } from '@angular/router';


import domtoimage from 'dom-to-image';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.scss'],
})
export class LearnComponent implements OnInit {

  @ViewChild("container", { static: false, read: ElementRef }) container: ElementRef;
  selectedSet: string;

  allSelectedWordIDs: number[];
  public wordDynamicData: any; // this always need to in synced with the stored data;
  allWordsData: any;
  selectedId: number = 3; // randomly setting it to avoid error
  allWordOfSets: any;
  selectedIDsDynamicData: any; // of type wordAppData
  url: any = {};
  activeURL = 0;
  isToShowDetails: boolean = false;
  isSafeUrlReady: boolean = true;
  isAllWordMastered: boolean = false;
  foundIDMapping = {};

  tabBars: any = ["https://www.google.com/search?igu=1&ei=&q=define+",
    "https://www.merriam-webster.com/dictionary/",
    "https://www.freethesaurus.com/"];
  tabBarsKeys = ['Google',
    'Merriam',
    'FreeThesaurus'];
  previousWordsIds = [];
  nextWordsIds = [] // this will be used when user go tp previous and click next

  img = [];
  images: any;



  constructor(private db: DatabaseService, private route: ActivatedRoute, public sanitizer: DomSanitizer, public shareService: SharingServiceService, private router: Router) {

    this.selectedSet = this.db.selectedSet;

  }

  noSelectedData() {
    this.isAllWordMastered = true;
  }
  ngOnInit() {

    this.allSelectedWordIDs = this.db.allSelectedWordIdsFiltered;
    // console.log(this.allSelectedWordIDs);
    this.wordDynamicData = this.db.wordsDynamicData;
    this.allWordsData = this.db.allWordsData;

    if (this.allSelectedWordIDs.length == 0) {
      this.isAllWordMastered = true;
    }
    this.route.paramMap.subscribe(params => {
      if (params.get('wordId')) {
        try {
          this.selectedId = parseInt(params.get('wordId'))
        }
        catch (e) {
          console.error(e)
        }
      }
      else if (this.allSelectedWordIDs.length != 0) {
        this.selectedId = this.allSelectedWordIDs[0]; // starting with the first word if no wordid is given in url
      }
      this.afterWordAppear();
      this.getSafeUrl();
      this.getIDMapping()
      this.getallImg();
    });
    // console.log(this.allWordsData[this.selectedId],this.wordDynamicData[this.selectedId]);

  }
  stopParentProp(event) {
    event.stopPropagation();
  }

  getallImg() {
    this.img = [];
    this.images = this.db.allWordsData[this.selectedId][7];
    //   this.img = this.images; --- why not this 
    this.images.forEach((url) => {
      this.img.push(url);
    });
  }


  goToUrl(syn) {
    this.router.navigate(['/mainmodule/base/wordSets/' + this.selectedSet + '/learn/' + wordToIdMap[syn]]);
    // console.log('/mainmodule/base/wordSets/' + this.viewType + '/' + wordToIdMap[syn])
  }

  getIDMapping() {
    this.foundIDMapping = {}
    this.allWordsData[this.selectedId][6].forEach(element => {
      if (element in wordToIdMap) {
        this.foundIDMapping[element] = true
      }
      else {
        this.foundIDMapping[element] = false
      }
    });
  }

  getSafeUrl(type?) {

    if (type == 1 && this.url[this.tabBarsKeys[this.activeURL]]) {
      return; // the event is coming from the tab changed and the url is already existing then don't repeat it.
    }
    let word = this.allWordsData[this.selectedId][1]
    this.url[this.tabBarsKeys[this.activeURL]] = this.sanitizer.bypassSecurityTrustResourceUrl(this.tabBars[this.activeURL] + word);
    this.isSafeUrlReady = true;
    this.afterFrameAppear();
  }

  shareButtonClone() {
    domtoimage.toPng(this.container.nativeElement)
      .then(function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        console.log(dataUrl);
        document.body.appendChild(img);
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  socialShare(event) {
    this.shareService.shareImageViaScreenshot(this.container);
  }

  onDynamicDataChange(setName?, wordId?, isToAdd?) {
    if (setName && wordId) {
      this.db.editWordIdInDynamicSet(setName, wordId, isToAdd);
    }
    this.db.saveCurrentStateofDynamicData(); // the data is directly access from the service so only need to be saved in localstorage
  }


  async afterWordAppear() {
    await new Promise(resolve => setTimeout(resolve, 2 * 1000));
    this.changeSeen(1, this.selectedId);
  }

  async afterFrameAppear() {
    await new Promise(resolve => setTimeout(resolve, 2 * 1000))
    this.onLoad();
  }


  changeMark(newMark, wordId) {
    this.wordDynamicData[wordId]["isMarked"] = newMark
    this.onDynamicDataChange("allMarked", wordId, newMark);
  }

  changeSeen(newMark, wordId) {
    this.wordDynamicData[wordId]["isSeen"] = newMark;
    if (newMark && !this.wordDynamicData[wordId]['viewedDate']) {
      // if the previous viewedDate doesn't exist then only edit it otherwise leave it
      this.wordDynamicData[wordId]['viewedDate'] = (new Date()).toUTCString(); // utc will be in 24 hour format to avoid sorting issue like 00:00 of afternoon was coming before the 10:00 in morning so to avoid that.... 
    }
    else if (!newMark) {
      this.wordDynamicData[wordId]['viewedDate'] = null; //if newmark is notSeen unset the viewedDate as well

    }
    this.onDynamicDataChange("allViewed", wordId, newMark);
  }


  previous() {
    if (this.previousWordsIds.length == 0) {
      this.db.presentToast("No Previous Word Found!!")
      return;
    }

    this.nextWordsIds.push(this.selectedId); // remove so that next previous will be different
    this.selectedId = this.previousWordsIds[this.previousWordsIds.length - 1];
    let Idtrimmed = this.previousWordsIds.splice(this.previousWordsIds.length - 1, 1);
    this.getSafeUrl();
    this.afterWordAppear();
    this.getIDMapping();
    this.getallImg();
  }


  next() {
    this.previousWordsIds.push(this.selectedId);
    let crntIndex = this.allSelectedWordIDs.indexOf(this.selectedId); // will be -1 if not availaible and move on to next
    if (this.nextWordsIds.length != 0) {
      this.selectedId = this.nextWordsIds[this.nextWordsIds.length - 1];
      this.nextWordsIds.splice(this.nextWordsIds.length - 1, 1);

    }
    else {
      let nextIdIndex: number = crntIndex + 1// this.getRndInteger(0, this.allSelectedWordIDs.length)
      let selectedIdIndex = nextIdIndex;
      this.selectedId = this.allSelectedWordIDs[selectedIdIndex];

    }

    this.getSafeUrl();
    this.afterWordAppear();
    this.getIDMapping();
    this.getallImg();
  }

  // Rang = [min, max)
  getRndInteger(min = 0, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  onTabChanged(event) {
    this.activeURL = event.index;
    this.getSafeUrl();// 1
  }
  onLoad() {
    let docs = document.getElementById('loadImg')
    if (docs) docs.style.display = 'none';
  }

  start(wordId, playNext) {
    if (this.db.player) {
      this.db.tooglePlayer(!this.db.onPause)
    }
    else if (!this.db.isPlaying) {
      this.db.startPodcast(wordId, playNext);
    }
    else {
      this.db.pause()
    }
  }

}
