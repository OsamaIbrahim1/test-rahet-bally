import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Admin End-to-End', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/admin/signUp (POST)', async () => {
        const signUpResponse = await request(app.getHttpServer())
            .post('/admin/signUp')
            .send({ email: 'test511@gmail.com', password: 'Test123!@#', name: 'Test', role: 'admin' });

        expect(signUpResponse.status).toBe(200);
        expect(signUpResponse.body.message).toBe('signUp successfully.');
    });

    it('/admin/signIn (POST)', async () => {
        const signInResponse = await request(app.getHttpServer())
            .post('/admin/signIn')
            .send({ email: 'test@example.com', password: 'test123' });

        expect(signInResponse.status).toBe(200);
        expect(signInResponse.body.message).toBe('signIn successfully.');
    });

});
