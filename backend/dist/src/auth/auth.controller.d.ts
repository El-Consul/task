import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: string;
            name: string;
        };
    }>;
    register(body: {
        email: string;
        password: string;
        name: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>;
}
