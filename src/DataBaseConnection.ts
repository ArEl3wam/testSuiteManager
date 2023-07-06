const mongoose=require('mongoose');


export function buildDatabase(databaseUrl:string) {
        
    return  mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })

}
export async function closeDatabase() {
    return mongoose.disconnect()
    .then(() => {
        console.log("disconnected from db ");
    })
    .catch((err:string) => {
        console.log("Disconnection Error with the database: "+err);
    });
}