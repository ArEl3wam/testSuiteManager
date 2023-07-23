import express from "express";
import qs from 'qs'
const bodyParser = require('body-parser');
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import {TestSuiteRouter} from "./routes/TestSuiteRoutes";
import {testCaseRouter}  from "./routes/testCaseRoutes";
import {validationTagRouter} from "./routes/validationTagRoutes";
import {valdationPointRouter} from "./routes/validationPointRoutes";
import {databaseRouter} from "./routes/databaseRoutes";
import {SearchRouter} from "./routes/searchRoutes";
import { shutdownRouter } from "./routes/shutdownRouter"
import { statisticsRouter } from "./routes/statisticsRoutes";
import { swapDatabaseConnection } from "./controllers/databaseController"; 
const cookieParser = require('cookie-parser');


export function createApp() {
  const app = express();

  app.set('query parser', (str: string) => {

    return qs.parse(str, {
      allowDots: true,
      decoder(str, defaultDecoder, charset, type) {
        if(type == 'key')  return str
        if(str == 'true' || str == 'false') return str == 'true'
        else if (!isNaN(parseFloat(str)) && !isNaN(<any>str - 0)) return parseFloat(str)
        else return defaultDecoder(str) 
      }
      })
  })

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use(express.json({
    
  }));

  app.use(cookieParser());
  app.use(swapDatabaseConnection)
  app.use(bodyParser.json());
  app.use(databaseRouter)
  app.use(TestSuiteRouter);
  app.use(testCaseRouter);
  app.use(validationTagRouter);
  app.use(valdationPointRouter);
  app.use(SearchRouter);
  app.use(shutdownRouter);
  app.use(statisticsRouter);

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "TRVT API",
        version: "1.0.0",
      },
    },
    apis: ["./src/components/**/*.openapi.yaml"],
  };

  const openapiSpecification = swaggerJsdoc(options);

  app.use("/api", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

  
  return app;
}
