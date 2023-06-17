import express from "express";
require("dotenv").config();
const bodyParser = require('body-parser');
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import TestSuiteRoutes from "./routes/TestSuiteRoutes";
import { testCaseRouter }  from "./routes/testCaseRoutes";
import { validationTagRouter } from "./routes/validationTagRoutes";
import qs from 'qs'
import { valdationPointRouter } from "./routes/validationPointRoutes";

import {databaseRouter  } from "./routes/databaseRoutes";

import { SearchRouter } from "./routes/searchRoutes";

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

  // adding middleware to enable CORS
  
  // app.use((req, res, next) => {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  //   next();
  // });

  app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

  app.use(express.json({
    
  }));
  app.use(bodyParser.json());
  app.use(databaseRouter)
  app.use(TestSuiteRoutes);
  app.use(testCaseRouter);
  app.use(validationTagRouter);
  app.use(valdationPointRouter)
  app.use(SearchRouter)

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
