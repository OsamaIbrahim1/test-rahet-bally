import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.services';
import { getModelToken } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { Admin, User } from '../../DB';
import { BadRequestException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as env from '../../config';

describe('UserService', () => {
    let userService: UserService;
    let jwtService: JwtService;

    const mockUserModel = {
        findOne: jest.fn(),
        create: jest.fn(),
    };
    const mockAdminModel = {
        findOne: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(Admin),
                    useValue: mockAdminModel,
                },
                {
                    provide: getModelToken(User),
                    useValue: mockUserModel,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ]
        }).compile();

        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
    });

    describe('signUp', () => {
        it('should throw an error if email already exists', async () => {
            mockUserModel.findOne.mockReturnValueOnce({ id: 2 });
            await expect(userService.SignUp({
                email: 'testosos11@gmail.com',
                password: 'Password123!@#',
                name: 'Test User',
                role: 'user'
            })).rejects.toThrow(HttpException)

        });

        it('should successfully create a new user', async () => {
            mockUserModel.findOne.mockReturnValueOnce(null);
            mockUserModel.findOne.mockReturnValueOnce(null);
            mockJwtService.sign.mockReturnValueOnce('signed-jwt-token');
            mockUserModel.create.mockReturnValueOnce({ id: 1 });

            const result = await userService.SignUp({
                email: 'testosos11@gmail.com',
                password: 'Password123!@#',
                name: 'Test User',
                role: 'user'
            });

            expect(result).toEqual({ id: 1 });
        });
    });

    describe('signIn', () => {
        it('should throw an error if email not found', async () => {
            mockUserModel.findOne.mockReturnValueOnce(null);

            await expect(userService.SignIn({
                email: 'testosos11111@gmail.com',
                password: 'Password123!@#',
            })).rejects.toThrow(HttpException);
        });

        it('should successfully sign in an user', async () => {
            mockUserModel.findOne.mockReturnValueOnce({
                id: 1,
                email: 'test@gmail.com',
                password: bcrypt.hashSync('password123', 10),
                save: jest.fn(),
            });

            mockJwtService.sign.mockReturnValueOnce('signed-jwt-token');

            const result = await userService.SignIn({
                email: 'test@gmail.com',
                password: 'password123',
            });

            expect(result).toEqual('signed-jwt-token');
        });
    });
});
