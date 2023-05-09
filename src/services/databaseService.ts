require('dotenv').config();

export async function readDatabaseUrls(){
    const databaseURLs = [];

    if (process.env.NUM_DATABASES) {
        const numDatabases = parseInt(process.env.NUM_DATABASES);
        for (let i = 1; i <= numDatabases; i++) {
          const key = `DATABASE_URL_${i}`;
          if (process.env[key]) {
            databaseURLs.push(process.env[key]);
          }
        }
      }
    return databaseURLs;
}