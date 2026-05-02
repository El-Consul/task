"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
const createServer = async () => {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization'],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    await app.init();
};
exports.createServer = createServer;
(0, exports.createServer)();
exports.default = (req, res) => {
    server(req, res);
};
if (process.env.NODE_ENV !== 'production') {
    const bootstrap = async () => {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors();
        app.setGlobalPrefix('api');
        await app.listen(3001);
    };
    bootstrap();
}
//# sourceMappingURL=main.js.map