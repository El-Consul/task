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
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }
    next();
});
let app;
async function bootstrap() {
    if (!app) {
        app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
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
    };
    startLocal();
}
//# sourceMappingURL=main.js.map