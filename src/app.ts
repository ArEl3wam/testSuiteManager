import express from "express";
import qs from "qs";
const bodyParser = require("body-parser");
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { TestSuiteRouter } from "./routes/TestSuiteRoutes";
import { testCaseRouter } from "./routes/testCaseRoutes";
import { validationTagRouter } from "./routes/validationTagRoutes";
import { valdationPointRouter } from "./routes/validationPointRoutes";
import { databaseRouter } from "./routes/databaseRoutes";
import { SearchRouter } from "./routes/searchRoutes";
import { shutdownRouter } from "./routes/shutdownRouter";
import { statisticsRouter } from "./routes/statisticsRoutes";
import { authRouter } from "./routes/authRoutes";
import { adminRouter } from "./routes/adminRoutes";
import { authMiddleware } from "./controllers/authController";
import userRouter from "./routes/userRoutes";
const cookieParser = require("cookie-parser");
const cors = require("cors");

export function createApp() {
  const app = express();

  app.set("query parser", (str: string) => {
    return qs.parse(str, {
      allowDots: true,
      decoder(str, defaultDecoder, charset, type) {
        if (type == "key") return str;
        if (str == "true" || str == "false") return str == "true";
        else if (!isNaN(parseFloat(str)) && !isNaN(<any>str - 0))
          return parseFloat(str);
        else return defaultDecoder(str);
      },
    });
  });

  const corsOptions = {
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    origin: "*",
  };
  app.use(cors(corsOptions));

  app.use(express.json({ limit: "16mb" }));

  app.use(cookieParser());
  app.use(authMiddleware); // this must be before swapDatabaseConnection
  app.use(bodyParser.json());
  app.use(databaseRouter);
  app.use(TestSuiteRouter);
  app.use(testCaseRouter);
  app.use(validationTagRouter);
  app.use(valdationPointRouter);
  app.use(SearchRouter);
  app.use(shutdownRouter);
  app.use(statisticsRouter);
  app.use(authRouter);
  app.use("/admin", adminRouter);
  app.use("/user", userRouter);

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
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      console.log(err);
      res.status(err.status || 500);
      res.json({
        status: "fail",
        error: {
          message: err.message || "Internal Server Error",
        },
      });
    }
  );

  return app;
}
