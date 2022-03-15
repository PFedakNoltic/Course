import {LightningElement, api, wire, track} from 'lwc';
import getTicketByContactId from '@salesforce/apex/TicketsController.getTicketByContactId';
import {getRecord} from 'lightning/uiRecordApi';
import {createRecord} from 'lightning/uiRecordApi';
import getTicketsByFilter from '@salesforce/apex/AllTicketsController.getTicketsByFilter';
import accRecordTypeList from '@salesforce/apex/AllTicketsController.accRecordTypeList';
import {refreshApex} from '@salesforce/apex';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import TICKET_OBJECT from '@salesforce/schema/Ticket__c';
import DISCOUNT_FIELD from '@salesforce/schema/Contact.Discount__c';
import CONTACTID_FIELD from '@salesforce/schema/Ticket__c.Contact__c';
import STATUS_FIELD from '@salesforce/schema/Ticket__c.Status__c';
import FLIGHTID_FIELD from '@salesforce/schema/Ticket__c.Flight_Info_Id__c';
import NAME_FIELD from '@salesforce/schema/Ticket__c.Name';
import LOCALE from '@salesforce/i18n/locale';

export default class AllTicketList extends LightningElement {
    value;

    @track data;
    searchable = [];
    wiredCases
    result;
    options;

    doneTypingInterval = 0;

    searchAllValue;

    departure = "";
    destination = "";
    recordType = "";
    discount;

    showTicketForm = false;
    disabled = false;
    @api recordId;

    @wire(getTicketByContactId, {contactId: '$recordId'})
    tickets;

    @wire(getRecord, {recordId: '$recordId', fields: [DISCOUNT_FIELD]})
    contact;

    // @wire(getObjectInfo, { objectApiName: FLIGHT_INFO_OBJECT })
    // flightInfoObjectInfo;
    //
    // get recordTypeId() {
    //     const flightInfoRecordTypeId = this.flightInfoObjectInfo.data.recordTypeInfos;
    //     return flightInfoRecordTypeId;
    // }
    //
    // @wire(getPicklistValues, { recordTypeId: recordTypeId(), fieldApiName: FLIGHT_INFO_OBJECT })
    // departureValues;


    @wire(getTicketsByFilter, {
        departure: "$departure",
        destination: "$destination",
        recordType: "$recordType"
    })
    wiredSObjects(result) {
        console.log("wire getting called");
        this.wiredCases = result;
        if (result.data) {
            this.result = result;
            this.searchable = this.data = result.data.map((caseObj, index) => ({
                caseData: {...caseObj},
                index: index + 1,
                rowIndex: index
            }));
        } else if (result.error) {
            console.error("Error", result.error);
        }
    }

    @wire(accRecordTypeList)
    wiredRecordSObjects(result) {
        console.log(JSON.stringify(result));
        if (result.data) {
            console.log(JSON.stringify(result));
            console.log(JSON.stringify(result.data));
            this.options = result.data.map((caseObj, index) => ({
                label: caseObj.Name,
                value: caseObj.DeveloperName
            }));
            console.log(JSON.stringify(this.options));
        } else if (result.error) {
            console.error("Error", error);
        }
    }


    priceWithDiscount(event) {
        this.discount = this[event.target] * (1.0 - DISCOUNT_FIELD);
        return discount;
    }


    handleChange(event) {
        this[event.target.name] = event.target.value;
        console.log("change", this[event.target.name]);
    }

    handleKeyUp(event) {
        clearTimeout(this.typingTimer);
        let value = event.target.value;
        let name = event.target.name;

        this.typingTimer = setTimeout(() => {
            this[name] = value;
        }, this.doneTypingInterval);
    }

    searchByDD(){
        this.showTicketForm = !this.showTicketForm;
    }


    clearSearch() {
        this.departure = "";
        this.destination = "";
        this.recordType = "";
        this.searchable = this.data;
        this.searchAllValue = "";
        this.searchAll();
        this.showTicketForm = false;

    }

    handleSearchAll(event) {
        this.searchAllValue = event.target.value;
        this.searchAll();
    }

    searchAll() {
        let searchStr = this.searchAllValue.toLowerCase();
        const regex = new RegExp(
            "(^" + searchStr + ")|(." + searchStr + ")|(" + searchStr + "$)"
        );
        if (searchStr.length > 2) {
            this.searchable = this.data.filter((item) => {
                if (
                    regex.test(
                        item.caseData.Flight_Info_Id__r.Destination__c.toLowerCase() +
                        " " +
                        item.caseData.Flight_Info_Id__r.Destination__c.toLowerCase()
                    ) ||
                    regex.test(
                        item.caseData.Flight_Info_Id__r.Departure__c?.toLowerCase() +
                        " " +
                        item.caseData.Flight_Info_Id__r.Departure__c?.toLowerCase()
                    )
                ) {
                    return item;
                }
            });
        } else if (this.departure.length <= 2) {
            this.searchable = this.data;
        }
        console.log(this.searchable);
    }

    handleNavigate(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                actionName: "view",
                recordId: event.target.dataset.id
            }
        });
    }


    buyTicket(event) {
        const fields = {};
        console.log(event.currentTarget.dataset.id);
        console.log(this.recordId);
        let dateNormalFormat = new Date(event.target.dataset.date);
        let formattedDate = new Intl.DateTimeFormat(LOCALE).format(dateNormalFormat);
        fields[NAME_FIELD.fieldApiName] = event.target.dataset.dep + '-' + event.target.dataset.des + ' ' + formattedDate;
        fields[FLIGHTID_FIELD.fieldApiName] = event.currentTarget.dataset.id;
        fields[CONTACTID_FIELD.fieldApiName] = this.recordId;
        fields[STATUS_FIELD.fieldApiName] = 'Booked';

        const recordInput = { apiName: TICKET_OBJECT.objectApiName, fields };

        console.log(recordInput);
        createRecord(recordInput)
            .then(() => {
                console.log('uiRecordApi')
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Contact updated',
                        variant: 'success'
                    })
                );
                console.log('Create ticket');
                refreshApex(this.tickets);
                return refreshApex(this.recordId);
            })
            .catch(error => {
                console.log('error')
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
                console.log('Error');
            });
        console.log('finish');
    }
}