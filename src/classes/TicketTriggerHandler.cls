public with sharing class TicketTriggerHandler {

    public static void handle(List<Ticket__c> newRecords, Map<Id, Ticket__c> oldMap, TriggerOperation operation) {
        switch on operation {
            when BEFORE_INSERT {
                BookedBeforeTriggerTicket(newRecords);
                flightInfoTriggerTicket(newRecords, oldMap);
            }
            when BEFORE_UPDATE {
                flightInfoTriggerTicket(newRecords, oldMap);
            }
        }
    }

    public static void BookedBeforeTriggerTicket(List<Ticket__c> newRecords) {
        for (Ticket__c newTicket : newRecords) {
            newTicket.Status__c = 'Booked';
        }
    }

    public static void flightInfoTriggerTicket(List<Ticket__c> newRecords, Map<Id, Ticket__c> oldMap) {
        Map<Id, Contact> contactMap = new Map<Id, Contact>();

        System.debug('flightInfoTriggerTicket');
        for (Ticket__c newTicket : newRecords) {
            contactMap.put(newTicket.Contact__c, null);
        }

        contactMap = new Map<Id, Contact>([
                SELECT Id, Traveled_miles__c
                FROM Contact
                WHERE Id IN :contactMap.keySet()
        ]);

        Map<Id, Flight_Info__c> infoMap = new Map<Id, Flight_Info__c>();

        for (Ticket__c newFlightInfo : newRecords) {

            infoMap.put(newFlightInfo.Flight_Info_Id__c, null);
        }

        infoMap = new Map<Id, Flight_Info__c>([
                SELECT Id,
                        Flight_Distance__c,
                        Business_available_seats__c,
                        Economy_available_seats__c
                FROM Flight_Info__c
                WHERE Id IN :infoMap.keySet()
        ]);
        System.debug(infoMap);
        System.debug(contactMap);

        Map<Id, Schema.RecordTypeInfo> rtMap = Ticket__c.SObjectType.getDescribe().getRecordTypeInfosById();
        Boolean b;
        for (Ticket__c ticketBooked : newRecords) {
            if (oldMap != null && oldMap.containsKey(ticketBooked.Id) && oldMap.get(ticketBooked.Id).Status__c == 'Booked') {
                b = true;
            } else {
                b = false;
            }
            if (rtMap.get(ticketBooked.RecordTypeId).getDeveloperName().contains(Constants.BUSINESS_TYPE)) {
                if (infoMap.get(ticketBooked.Flight_Info_Id__c).Business_available_seats__c <= 0) {
                    ticketBooked.addError('This flight has not available seats in Business class');
                    System.debug('infoMap.get(ticketBooked.Flight_Info_Id__c).Business_available_seats__c <= 0');
                }
                if (ticketBooked.Status__c == 'Booked' && oldMap == null) {
                    infoMap.get(ticketBooked.Flight_Info_Id__c).Business_available_seats__c -= 1;
                    System.debug('ticketBooked.Status__c == \'Booked\' && oldMap == null');
                } else if (ticketBooked.Status__c == 'Returned' && contactMap != null && b == true) {
                    System.debug('ticketBooked.Status__c == \'Returned\' && contactMap != null');
                    infoMap.get(ticketBooked.Flight_Info_Id__c).Business_available_seats__c += 1;
                    ticketBooked.Contact__c = null;
                } else if (ticketBooked.Status__c == 'Completed' && contactMap != null && b == true) {
                    System.debug('ticketBooked.Status__c == \'Completed\' && contactMap != null');
                    contactMap.get(ticketBooked.Contact__c).Traveled_miles__c =
                            infoMap.get(ticketBooked.Flight_Info_Id__c).Flight_Distance__c * 0.3 +
                                    contactMap.get(ticketBooked.Contact__c).Traveled_miles__c;
                }


            } else if (rtMap.get(ticketBooked.RecordTypeId).getDeveloperName().contains(Constants.ECONOMY_TYPE)) {
                if (infoMap.get(ticketBooked.Flight_Info_Id__c).Economy_available_seats__c <= 0) {
                    System.debug('infoMap.get(ticketBooked.Flight_Info_Id__c).Economy_available_seats__c <= 0');
                    ticketBooked.addError('This flight has not available seats in Economy class');
                }
                if (ticketBooked.Status__c == 'Booked' && oldMap == null) {
                    System.debug('ticketBooked.Status__c == \'Booked\' && oldMap == null');
                    infoMap.get(ticketBooked.Flight_Info_Id__c).Economy_available_seats__c -= 1;
                } else if (ticketBooked.Status__c == 'Returned' && contactMap != null && b == true) {
                    System.debug('ticketBooked.Status__c == \'Returned\' && contactMap != null');
                    infoMap.get(ticketBooked.Flight_Info_Id__c).Economy_available_seats__c += 1;
                    ticketBooked.Contact__c = null;

                } else if (ticketBooked.Status__c == 'Completed' && contactMap != null && b == true) {
                    System.debug('ticketBooked.Status__c == \'Completed\' && contactMap != null');
                    contactMap.get(ticketBooked.Contact__c).Traveled_miles__c =
                            infoMap.get(ticketBooked.Flight_Info_Id__c).Flight_Distance__c * 0.1 +
                                    contactMap.get(ticketBooked.Contact__c).Traveled_miles__c;
                }
            }
        }
        update infoMap.values();
        update contactMap.values();
    }
}