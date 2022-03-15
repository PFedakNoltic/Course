public with sharing class FlightInfoTriggerHandler {

    public static void handle(List<Flight_Info__c> newRecords, Map<Id, Flight_Info__c> oldMap, TriggerOperation operation) {
        switch on operation {
            when BEFORE_INSERT {
                checkSuccessAircraftFlightInfoTrigger(newRecords,oldMap);
                aircraftFlightInfoTrigger(newRecords, oldMap);
//                destinationAndDepartureFlightInfoTrigger(newRecords, oldMap);
            }
//            when BEFORE_UPDATE {
//                checkSuccessAircraftFlightInfoTrigger(newRecords,oldMap);
//                destinationAndDepartureFlightInfoTrigger(newRecords, oldMap);
//            }
        }
    }


    public static void aircraftFlightInfoTrigger(List<Flight_Info__c> newRecords, Map<Id, Flight_Info__c> oldMap) {
        Map<Id, Aircraft__c> aircraftMap = new Map<Id, Aircraft__c>();

        for (Flight_Info__c newFlightInfo : newRecords) {
            aircraftMap.put(newFlightInfo.AircraftId__c, null);
        }

        aircraftMap = new Map<Id, Aircraft__c>([
                SELECT Id,
                        Business_seats__c,
                        Economy_seats__c
                FROM Aircraft__c
                WHERE Id IN :aircraftMap.keySet()
        ]);
        for (Flight_Info__c seats : newRecords) {
            seats.Business_available_seats__c = aircraftMap.get(seats.AircraftId__c).Business_seats__c;
            seats.Economy_available_seats__c = aircraftMap.get(seats.AircraftId__c).Economy_seats__c;
        }
    }

    public static void checkSuccessAircraftFlightInfoTrigger(List<Flight_Info__c> newRecords, Map<Id, Flight_Info__c> oldMap) {
        List<Flight_Info__c> flightInfos = new List<Flight_Info__c>();
        flightInfos = new List<Flight_Info__c>([
                SELECT Id,
                        AircraftId__c,
                        Date_time_of_Flight__c,
                        Finish_flight_time__c
                FROM Flight_Info__c
        ]);

        for (Flight_Info__c newRec : newRecords) {
            for (Flight_Info__c anotherFI : flightInfos) {
                if (newRec.AircraftId__c == anotherFI.AircraftId__c &&
                        newRec.Date_time_of_Flight__c >= anotherFI.Date_time_of_Flight__c &&
                        newRec.Date_time_of_Flight__c <= anotherFI.Finish_flight_time__c  ||
                        newRec.AircraftId__c == anotherFI.AircraftId__c &&
                        newRec.Finish_flight_time__c >= anotherFI.Date_time_of_Flight__c &&
                        newRec.Finish_flight_time__c <= anotherFI.Finish_flight_time__c) {
                    newRec.AircraftId__c.addError('Aircraft for this time already used');
                }
            }
        }
    }
}