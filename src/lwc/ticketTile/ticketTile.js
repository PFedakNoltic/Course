import {LightningElement, api, wire} from 'lwc';
import flightForTicket from '@salesforce/apex/DepartureController.flightForTicket';
import {refreshApex} from "@salesforce/apex";
import LOCALE from "@salesforce/i18n/locale";
import {createRecord, getRecord} from "lightning/uiRecordApi";
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import TICKET_OBJECT from '@salesforce/schema/Ticket__c';
import CONTACTID_FIELD from '@salesforce/schema/Ticket__c.Contact__c';
import RECORD_TYPE_ID_FIELD from '@salesforce/schema/Ticket__c.RecordTypeId';
import FLIGHTID_FIELD from '@salesforce/schema/Ticket__c.Flight_Info_Id__c';
import NAME_FIELD from '@salesforce/schema/Ticket__c.Name';
import DISCOUNT_FIELD from '@salesforce/schema/Contact.Discount__c';
import getTicketByContactId from '@salesforce/apex/TicketsController.getTicketByContactId';
import BUS from '@salesforce/resourceUrl/B2C';
import ECO from '@salesforce/resourceUrl/ECO';

export default class TicketTile extends LightningElement {

    @api recordId;
    @api showClass;
    @api picture;
    @api flightId;
    @api ticketTypeId;
    @api ticketTypeName;
    selectFlight = {};

    @wire(getRecord, {recordId: '$recordId', fields: [DISCOUNT_FIELD]})
    contactDiscount;
    contDisc;
    photo;

    @api
    get putPicture() {
        return this.photo;
    }

    set putPicture(value) {
        this.ticketTypeName = value;
        if (this.ticketTypeName === 'Business') {
            this.photo = BUS;
        } else if (this.ticketTypeName === 'Economy') {
            this.photo = ECO;
        }
    }

    priceWithDiscount;

    @api
    get putPriceWithDiscount() {
        if (this.contactDiscount.data !== undefined) {
            this.contDisc = this.contactDiscount.data.fields.Discount__c.value;
            if (this.ticketTypeName === 'Business') {
                this.priceWithDiscount = ((this.selectFlight.Flight_Distance__c * (1.0 - this.contDisc)) / 13).toFixed(2);
                console.log('priceWithDiscount');
                console.log(this.priceWithDiscount);
                console.log(this.contactDiscount.data.fields.Discount__c.value);
                console.log(this.selectFlight.Flight_Distance__c);
            } else if (this.ticketTypeName === 'Economy') {
                this.priceWithDiscount = ((this.selectFlight.Flight_Distance__c * (1.0 - this.contDisc)) / 28).toFixed(2);
            }
        }
        return this.priceWithDiscount;
    }

    set putPriceWithDiscount(value) {
        this.ticketTypeName = value;
    }

    @wire(getTicketByContactId, {contactId: '$recordId'})
    tickets;

    @wire(flightForTicket, {
        flightId: '$flightId'
    })
    flightInfoObjet(value) {
        const {data, error} = value;
        if (data) {
            this.selectFlight = data;
            console.log('value');
            console.log(value);
            console.log(this.selectFlight);
            console.log('selectFlight');
        } else if (error) {
            console.log('(error---> ' + JSON.stringify(error));
        }
    }

    buyTicketInTile() {
        const fields = {};

        let dateNormalFormat = new Date(this.selectFlight.Date_time_of_Flight__c);
        let formattedDate = new Intl.DateTimeFormat(LOCALE).format(dateNormalFormat);
        fields[NAME_FIELD.fieldApiName] = this.selectFlight.Departure__c + '-' + this.selectFlight.Destination__c + ' ' + formattedDate;
        fields[FLIGHTID_FIELD.fieldApiName] = this.flightId;
        fields[CONTACTID_FIELD.fieldApiName] = this.recordId;
        fields[RECORD_TYPE_ID_FIELD.fieldApiName] = this.ticketTypeId;

        const recordInput = {apiName: TICKET_OBJECT.objectApiName, fields};
        console.log('=======');
        console.log(this.recordId);
        console.log(this.ticketTypeId);
        console.log("this.recordId.value");
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
                        title: 'Sorry',
                        message: 'In this class, there are no available seats',
                        variant: 'error'
                    })
                );
                console.log('Error');
            });
        console.log('finish');
    }
}