import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from '../services';
import { SignUpBodyDTO, SignInBodyDTO } from '../../DTO';
import { Response } from 'express';

describe('AdminController', () => {
    let controller: AdminController;
    let service: AdminService;

    const mockAdminService = {
        SignUp: jest.fn(),
        SignIn: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminController],
            providers: [
                {
                    provide: AdminService,
                    useValue: mockAdminService,
                },
            ],
        }).compile();

        controller = module.get<AdminController>(AdminController);
        service = module.get<AdminService>(AdminService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('signUp', () => {
        it('should call the signUp service method', async () => {
            const signUpDto: SignUpBodyDTO = {
                email: 'test@example.com',
                password: 'Password123',
                name: 'Test User',
                role: 'admin',
            };

            const responseMock = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            await controller.SignUp(signUpDto, responseMock);

            expect(service.SignUp).toHaveBeenCalledWith(signUpDto);
            expect(responseMock.status).toHaveBeenCalledWith(200);
            expect(responseMock.json).toHaveBeenCalledWith({
                message: 'signUp successfully.',
                data: undefined,
            });
        });
    });

    describe('signIn', () => {
        it('should call the signIn service method', async () => {
            const signInDto: SignInBodyDTO = {
                email: 'test@gmail.com',
                password: 'Password123',
            };

            const responseMock = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            await controller.SignIn(signInDto, responseMock);

            expect(service.SignIn).toHaveBeenCalledWith(signInDto);
            expect(responseMock.status).toHaveBeenCalledWith(200);
            expect(responseMock.json).toHaveBeenCalledWith({
                message: 'signIn successfully.',
                data: undefined,
            });
        });
    });
});
