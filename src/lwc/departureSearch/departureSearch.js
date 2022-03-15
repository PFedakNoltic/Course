import {LightningElement, api, wire, track} from 'lwc';

import fetchLookupData from '@salesforce/apex/DepartureController.fetchLookupData';
import fetchDefaultRecord from '@salesforce/apex/DepartureController.fetchDefaultRecord';
import FLIGHT_INFO_OBJECT from '@salesforce/schema/Flight_Info__c';

const DELAY = 300; // dealy apex callout timing in miliseconds

export default class DepartureSearch extends LightningElement {

    // public properties with initial default values
    @api label = 'custom lookup label';
    @api placeholder = 'search...';
    @api iconName = 'utility:forward_up';
    @api showDepartureForm = false;
    @api sObjectApiName = FLIGHT_INFO_OBJECT.apiName;
    @api fieldApiName;
    @api defaultRecordId;
    @api searchKey = '';
    @api value = '';
    // private properties
    lstResult = []; // to store list of returned records
    hasRecords = true;
    ''
    searchKeyTwo = ''; // to store input field value
    isSearchLoading = false; // to control loading spinner
    delayTimeout;
    selectedRecord = {}; // to store selected lookup record in object formate

    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';

    // initial function to populate default selected lookup record if defaultRecordId provided

    //
    // get classValue(){
    //     console.log('OPPO');
    //     return  this.value === true ? 'slds-hide' : '';
    // }

    connectedCallback() {
        console.log('1fff');
        console.log(this.fieldApiName);
        console.log(this.lstResult);
        if (this.defaultRecordId === undefined) {
            console.log('2ffff');
            fetchDefaultRecord({defaultRecordId: this.defaultRecordId, 'sObjectApiName': this.sObjectApiName})
                .then((result) => {
                    console.log('3fff');
                    console.log(result + '00000');
                    console.log('result');
                    console.log(this.selectedRecord);
                    if (result != null) {
                        this.selectedRecord = result;
                        console.log(this.selectedRecord);

                        // this.handelSelectRecordHelper(); // helper function to show/hide lookup result container on UI
                    }
                })
                .catch((error) => {
                    this.error = error;
                    this.selectedRecord = {};
                });

        }
    }

    // wire function property to fetch search record based on user input
    @wire(fetchLookupData, {
        searchKey: '$searchKey',
        searchKeyTwo: '$searchKeyTwo',
        sObjectApiName: '$sObjectApiName',
        filterField: '$fieldApiName'
    })
    searchResult(value) {
        const {data, error} = value; // destructure the provisioned value
        this.isSearchLoading = false;
        if (data) {
            this.hasRecords = data.length !== 0;
            this.lstResult = JSON.parse(JSON.stringify(data));
        } else if (error) {
            console.log('(error---> ' + JSON.stringify(error));
        }
        console.log('this.lstResult');
        console.log(this.lstResult);
        console.log(JSON.parse(JSON.stringify(this.searchKey)));
    };

    // update searchKey property on input field change
    handleKeyChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        this.isSearchLoading = true;
        window.clearTimeout(this.delayTimeout);
        const searchKeyTwo = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchKeyTwo = searchKeyTwo;
        }, DELAY);
        console.log('1');
    }

    handleClick() {
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open';
    }

    handleLeaveClick() {
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    }

    // // method to toggle lookup result section on UI
    // toggleResult(event) {
    //     const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
    //     const clsList = lookupInputContainer.classList;
    //     const whichEvent = event.target.getAttribute('data-source');
    //     switch (whichEvent) {
    //         case 'searchInputField':
    //             clsList.add('slds-is-open');
    //             break;
    //         case 'lookupContainer':
    //             clsList.remove('slds-is-open');
    //             break;
    //     }
    // }

    // method to clear selected lookup record
    handleRemove() {
        console.log('searchKeyTwo');
        console.log(JSON.parse(JSON.stringify(this.searchKey)));
        console.log(this.searchKeyTwo);
        console.log(this.selectedRecord);
        console.log('3');
        this.searchKeyTwo = '';
        this.selectedRecord = {};
        this.lookupUpdatehandler(undefined); // update value on parent component as well from helper function
        // // remove selected pill and display input field again
        // const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
        // searchBoxWrapper.classList.remove('slds-hide');
        // searchBoxWrapper.classList.add('slds-show');
        // const pillDiv = this.template.querySelector('.pillDiv');
        // pillDiv.classList.remove('slds-show');
        // pillDiv.classList.add('slds-hide');

        console.log('3');
        // console.log(searchBoxWrapper);
    }

    // method to update selected record from search result
    handelSelectedRecord(event) {
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        var objId = event.target.getAttribute('data-recid'); // get selected record Id
        // this.defaultRecordId = objId;
        // fetchDefaultRecord(this.defaultRecordId).then(()=>{
        //
        // })
        this.selectedRecord = this.lstResult.find(data => data.value === objId); // find selected record from list
        this.lookupUpdatehandler(this.selectedRecord); // update value on parent component as well from helper function
        // const customDeparture = new CustomEvent('firstkey',{detail:this.selectedRecord.departure});
        // console.log('customDeparture');
        // console.log(customDeparture);
        // this.dispatchEvent(customDeparture);
        // this.handelSelectRecordHelper(); // helper function to show/hide lookup result container on UI

        console.log('4');
        console.log(this.searchKeyTwo);
        console.log(this.searchKey);
        console.log(this.lstResult);
        console.log(this.selectedRecord);
    }

    /*COMMON HELPER METHOD STARTED*/
    // handelSelectRecordHelper() {
    //     this.template.querySelector('.lookupInputContainer').classList.remove('slds-is-open');
    //     const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
    //     searchBoxWrapper.classList.remove('slds-show');
    //     searchBoxWrapper.classList.add('slds-hide');
    //     const pillDiv = this.template.querySelector('.pillDiv');
    //     pillDiv.classList.remove('slds-hide');
    //     pillDiv.classList.add('slds-show');
    //
    //     console.log('5');
    //     console.log(this.searchKeyTwo);
    // }

// send selected lookup record to parent component using custom event
    lookupUpdatehandler(value) {
        // const pEvent = new CustomEvent('lookuptickets',
        //     {
        //         detail: {selectedRecord: value, fieldApiName: this.fieldApiName}
        //     }
        // );
        // this.dispatchEvent(pEvent);
        const oEvent = new CustomEvent('lookupupdate',
            {
                detail: {selectedRecord: value, fieldApiName: this.fieldApiName}
            }
        );
        this.dispatchEvent(oEvent);
        console.log('6');
    }
}