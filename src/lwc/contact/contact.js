import {LightningElement, api} from 'lwc';

export default class Contact extends LightningElement {
    @api contactItem;

    selectHandler(event) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('selected', {detail: this.contactItem.Name}));
    }
}