public with sharing class DepartureController {
    @AuraEnabled(Cacheable=true)
    public static List<RecordsData> fetchLookupData(Map<String, String> searchKey, String searchKeyTwo, String sObjectApiName, String filterField) {
        List < RecordsData > returnList = new List < RecordsData > ();
        String filter = '';
        Datetime dt = System.now();
        System.debug(searchKey);

        if (searchKey != null) {
            for (String key : searchKey.keySet()) {
                filter += key + ' = \'' + searchKey.get(key) + '\',';
            }
        }

        System.debug(filter);
        String sWildCardTextTwo = '%' + searchKeyTwo + '%';
        String sQuery;

        if (String.isNotBlank(filter)) {
            System.debug('filter111');
            sQuery = 'SELECT Id,Name,Departure__c,Destination__c ' +
                    'FROM ' + sObjectApiName + ' ' +
                    'WHERE ' + filter.removeEnd(',') + '' +
                    'AND Date_time_of_Flight__c > ' + dt.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'') + ' ' +
                    'LIMIT 5';
        }
        else {
            System.debug('filter22222');
            sQuery = 'SELECT Id,Name,' + filterField + ' ' +
                    'FROM ' + sObjectApiName + ' ' +
                    'WHERE ' + filterField + ' LIKE : sWildCardTextTwo ' +
                    'AND Date_time_of_Flight__c > ' + dt.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'') + ' ' +
                    'LIMIT 5';
        }
        System.debug(sQuery);
        for (SObject obj : Database.query(sQuery)) {
            returnList.add(new RecordsData((String) obj.get(filterField), (String) obj.get('id')));
        }

        Set<String> setRec = new Set<String>();
        for (RecordsData s : returnList) {
            setRec.add(s.label);
        }

        List<RecordsData> newList = new List<DepartureController.RecordsData>();
        for (RecordsData k : returnList) {
            for (String p : setRec) {
                if (k.label == p) {
                    newList.add(k);
                    setRec.remove(p);
                }
            }
        }
        System.debug(newList);
        return newList;
    }

    public class RecordsData {
        @AuraEnabled public String label;
        @AuraEnabled public String value;
        public RecordsData(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }

    @AuraEnabled(Cacheable=true)
    public static Flight_Info__c flightForTicket(Id flightId) {
        return [
                SELECT
                        Name,
                        Destination__c,
                        Departure__c,
                        Flight_Distance__c,
                        Date_time_of_Flight__c,
                        Finish_flight_time__c
                FROM Flight_Info__c
                WHERE Id = :flightId
        ];
    }

    // Method to fetch lookup default value
    @AuraEnabled
    public static SObject fetchDefaultRecord(String defaultRecordId, String sObjectApiName) {
        String sRecId = defaultRecordId;
        String sQuery = 'Select Id,Name,Departure__c,Destination__c ' +
                'From ' + sObjectApiName + ' ' +
                'Where Id = : sRecId LIMIT 5';
        for (SObject obj : Database.query(sQuery)) {
            System.debug(obj);
            System.debug('fsdf');
            return obj;
        }
        System.debug('23');
        return null;
    }

}