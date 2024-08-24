import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.services';
import { getModelToken } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { Admin, User } from '../../DB';
import { BadRequestException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AdminService', () => {
    let service: AdminService;
    let jwtService: JwtService;

    const mockAdminModel = {
        findOne: jest.fn(),
        create: jest.fn(),
    };
    const mockUserModel = {
        findOne: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminService,
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
            ],
        }).compile();

        service = module.get<AdminService>(AdminService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signUp', () => {
        it('should throw an error if email already exists', async () => {
            mockAdminModel.findOne.mockReturnValueOnce({ id: 2 });
            await expect(service.SignUp({
                email: 'testosos11@gmail.com',
                password: 'Password123!@#',
                name: 'Test User',
                role: 'admin'
            })).rejects.toThrow(HttpException)

        });

        it('should successfully create a new admin', async () => {
            mockAdminModel.findOne.mockReturnValueOnce(null);
            mockUserModel.findOne.mockReturnValueOnce(null);
            mockJwtService.sign.mockReturnValueOnce('signed-jwt-token');
            mockAdminModel.create.mockReturnValueOnce({ id: 1 });

            const result = await service.SignUp({
                email: 'testosos11@gmail.com',
                password: 'Password123!@#',
                name: 'Test User',
                role: 'admin'
            });

            expect(result).toEqual({ id: 1 });
        });
    });

    describe('signIn', () => {
        it('should throw an error if email not found', async () => {
            mockAdminModel.findOne.mockReturnValueOnce(null);

            await expect(service.SignIn({
                email: 'testosos11111@gmail.com',
                password: 'Password123!@#',
            })).rejects.toThrow(HttpException);
        });


        it('should successfully sign in an admin', async () => {
            mockAdminModel.findOne.mockReturnValueOnce({
                id: 1,
                email: 'test@example.com',
                password: bcrypt.hashSync('password123', 10),
                save: jest.fn(),
            });

            mockJwtService.sign.mockReturnValueOnce('signed-jwt-token');

            const result = await service.SignIn({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(result).toEqual('signed-jwt-token');
        });
    });
});
