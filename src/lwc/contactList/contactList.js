import {LightningElement} from 'lwc';

export default class ContactList extends LightningElement {
    selectedContact;

    contacts = [
        {
            Id: 1,
            Name: 'Paul Fedak',
            Company__c: 'Bla',
            Phone: '+380986196676',
            Title: 'Some title'
        },
        {
            Id: 2,
            Name: 'Marko Holak',
            Phone: '+380676750525',
            Title: 'Another title'
        },
        {
            Id: 3,
            Name: 'Marko Zaluzkiyi',
            Company__c: 'Bla Bla Bla',
            Phone: '+380933442697',
        }
    ];

    contactSelected(event) {
        this.selectedContact = event.detail;
    }
}