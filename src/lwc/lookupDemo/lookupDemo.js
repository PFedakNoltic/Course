import {api, LightningElement} from 'lwc';

export default class LookupDemo extends LightningElement {
    @api recordId;
    departureBuff = {};
    firstStory = {};
    secondStory = {};
    defaultStory = {};
    isTwoKeys = false;
    disabled = true;
    selectedRecordIdForTicket;
    counter = 0;
    lastFieldName = '';


    // handel custom lookup component event
    lookupRecord(event) {
        this.counter += 1;
        if (this.counter === 2) {
            this.disabled = false;
        } else if (this.counter !== 2) {
            this.disabled = true;
            this.isTwoKeys = false;
        }
        alert('Selected Record Value on Parent Component is ' + JSON.stringify(event.detail));
        if (event.detail.selectedRecord !== undefined) {
            this.departureBuff = {[event.detail.fieldApiName]: JSON.parse(JSON.stringify(event.detail)).selectedRecord.label};
            this.firstStory = this.secondStory;
            this.secondStory = this.departureBuff;
            this.selectedRecordIdForTicket = JSON.parse(JSON.stringify(event.detail)).selectedRecord.value;
            this.lastFieldName = event.detail.fieldApiName

        } else if (event.detail.fieldApiName === this.lastFieldName) {
            this.departureBuff = this.firstStory;
            this.secondStory = this.defaultStory;
            this.firstStory = this.secondStory;
            this.counter -= 2;
            this.disabled = true;
            this.isTwoKeys = false;

        } else {
            this.departureBuff = this.secondStory;
            this.firstStory = this.defaultStory;
            this.secondStory = this.firstStory;
            this.counter -= 2;
            this.disabled = true;
            this.isTwoKeys = false;
        }
        console.log('qqqq');
        console.log(this.departureBuff);
        console.log(this.lastFieldName + 'lastFieldName');
        console.log(this.firstStory);
        console.log(this.secondStory);
        console.log('COUNTER' + this.counter);
        // this.departureBuff = this.departureBuff.selectedRecord.Departure__c;
        console.log('wwww');
        // selected record in normal format
        // {Id: 'a0E7Q000000LrpRUAS', Name: 'SecondTest', Departure__c: 'Brasilia'}

    }

    showTickets() {
        this.isTwoKeys = true;
    }
}