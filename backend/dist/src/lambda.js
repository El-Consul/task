"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const serverless_http_1 = __importDefault(require("serverless-http"));
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
let cachedHandler;
async function bootstrap() {
    if (!cachedHandler) {
        const expressApp = (0, express_1.default)();
        const nestApp = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
        nestApp.enableCors({
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        });
        nestApp.setGlobalPrefix('api');
        await nestApp.init();
        cachedHandler = (0, serverless_http_1.default)(expressApp);
    }
    return cachedHandler;
}
const handler = async (event, context) => {
    const handler = await bootstrap();
    return handler(event, context);
};
exports.handler = handler;
//# sourceMappingURL=lambda.js.map