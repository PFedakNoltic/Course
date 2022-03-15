public class Sched implements Schedulable{

    public void execute(SchedulableContext ctx) {
        MyBatchClass myBatch = new MyBatchClass();
        Database.executeBatch(myBatch);
    }
}