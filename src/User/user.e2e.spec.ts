import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('User End-to-End', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/user/signUp (POST)', async () => {
        const signUpResponse = await request(app.getHttpServer())
            .post('/user/signUp')
            .send({ email: 'test51111@gmail.com', password: 'Test123!@#', name: 'Test', role: 'user' });

        expect(signUpResponse.status).toBe(200);
        expect(signUpResponse.body.message).toBe('signUp successfully.');
    });

    it('/user/signIn (POST)', async () => {
        const signInResponse = await request(app.getHttpServer())
            .post('/user/signIn')
            .send({ email: 'test51111@gmail.com', password: 'Test123!@#' });

        expect(signInResponse.status).toBe(200);
        expect(signInResponse.body.message).toBe('signIn successfully.');
    });

});
