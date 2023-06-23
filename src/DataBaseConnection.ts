const mongoose=require('mongoose');


export async function buildDatabase(databaseUrl:string) {
    console.log(databaseUrl);
    
    return mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connected to db ", databaseUrl);
    })
    .catch((err:string) => {
        
        console.log("Connection Error with the database: "+err);
        // throw  err;
    });

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