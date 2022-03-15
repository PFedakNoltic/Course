import {LightningElement, api, wire} from 'lwc';
import accRecordTypeList from '@salesforce/apex/AllTicketsController.accRecordTypeList';

export default class TicketTiles extends LightningElement {

    @api recordId;
    @api flightInfoId;
    options;


    @wire(accRecordTypeList, {})
    wiredRecordSObjects(result) {
        console.log(JSON.stringify(result));
        if (result.data) {
            console.log(JSON.stringify(result));
            console.log(JSON.stringify(result.data));
            this.options = result.data.map((caseObj, index) => ({
                label: caseObj.DeveloperName,
                value: caseObj.Id
            }));

            console.log(JSON.stringify(this.options));
        } else if (result.error) {
            console.error("Error", error);
        }
    }


}