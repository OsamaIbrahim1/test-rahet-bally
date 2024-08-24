import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services';
import { SignUpBodyDTO, SignInBodyDTO } from '../../DTO';
import { Response } from 'express';

describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;

    const mockUserService = {
        SignUp: jest.fn(),
        SignIn: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(userController).toBeDefined();
    });

    describe('signUp', () => {
        it('should call the signUp service method', async () => {
            const signUpDto: SignUpBodyDTO = {
                email: 'test22@gmail.com',
                password: 'Password123!@#',
                name: 'Test User',
                role: 'user',
            };

            const responseMock = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            await userController.SignUp(signUpDto, responseMock);

            expect(userService.SignUp).toHaveBeenCalledWith(signUpDto);
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
                email: 'test@example.com',
                password: 'Password123',
            };

            const responseMock = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            await userController.SignIn(signInDto, responseMock);

            expect(userService.SignIn).toHaveBeenCalledWith(signInDto);
            expect(responseMock.status).toHaveBeenCalledWith(200);
            expect(responseMock.json).toHaveBeenCalledWith({
                message: 'signIn successfully.',
                data: undefined,
            });
        });
    });
});
