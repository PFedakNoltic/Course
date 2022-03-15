public with sharing class MyBatchClass implements Database.Batchable<SObject> {

    public Database.QueryLocator start(Database.BatchableContext bc) {
        Datetime dt = System.now();
        return Database.getQueryLocator(
        'SELECT Id,Status__c,Contact__c,Flight_Info_Id__r.Id,Flight_Info_Id__r.Finish_flight_time__c ' +
                'FROM Ticket__c ' +
                'WHERE Contact__c !=null AND ' +
                'Flight_Info_Id__r.Finish_flight_time__c > ' + dt.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''));

    }
    public void execute(Database.BatchableContext bc, List<Ticket__c> records) {
        List<Ticket__c> tickets = new List<Ticket__c>();
            for (Ticket__c ti : records) {
                ti.Status__c = 'Completed';
                tickets.add(ti);
        }
        update tickets;
        System.debug(tickets);

    }
    public void finish(Database.BatchableContext bc) {
    }

}