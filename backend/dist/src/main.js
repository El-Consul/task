"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
let app;
async function bootstrap() {
    if (!app) {
        app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
        app.enableCors({
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
            credentials: true,
        });
        app.setGlobalPrefix('api');
        await app.init();
    }
}
exports.default = async (req, res) => {
    await bootstrap();
    server(req, res);
};
if (process.env.NODE_ENV !== 'production') {
    const startLocal = async () => {
        const localApp = await core_1.NestFactory.create(app_module_1.AppModule);
        localApp.enableCors();
        localApp.setGlobalPrefix('api');
        await localApp.listen(3001);
        console.log('🚀 Local Backend running at http://localhost:3001/api');
    };
    startLocal();
}
//# sourceMappingURL=main.js.map