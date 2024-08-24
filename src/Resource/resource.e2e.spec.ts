import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ResourceModule } from '../modules';
import { SequelizeModule } from '@nestjs/sequelize';
import { Resource } from '../DB';

describe('ResourceController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/resource/createResource (POST)', async () => {
        return request(app.getHttpServer())
            .post('/resource/createResource')
            .set('Authorization', `Bearer YOUR_TOKEN_HERE`)
            .attach('image', 'path/to/your/file.jpg')
            .field('title', 'Test Resource')
            .field('description', 'Test Description')
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toEqual('Resource created successfully.');
                expect(res.body.data).toHaveProperty('title', 'Test Resource');
            })
            .timeout(10000); // Increase the timeout to 10000 ms
    });

    afterAll(async () => {
        await app.close();
    });
});

describe('ResourceController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ResourceModule,
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          models: [Resource],
          autoLoadModels: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/resource/createResource (POST)', async () => {
      const response = await request(app.getHttpServer())
          .post('/resource/createResource')
          .send({ title: 'Test Resource', description: 'Test Description' })
          .expect(201)
          .timeout(10000); // Increase the timeout to 10000 ms
  
      expect(response.body.message).toBe('Resource created successfully.');
  });

  it('/resource/updateResource/:resourceId (PUT)', async () => {
    const resource = await request(app.getHttpServer())
      .post('/resource/createResource')
      .send({ title: 'Update Resource', description: 'Update Description' });

    const response = await request(app.getHttpServer())
      .put(`/resource/updateResource/${resource.body.data.id}`)
      .send({ title: 'Updated Title', description: 'Updated Description' })
      .expect(200);

    expect(response.body.data.title).toBe('Updated Title');
    expect(response.body.data.description).toBe('Updated Description');
  });

  it('/resource/deleteResource/:resourceId (DELETE)', async () => {
    const resource = await request(app.getHttpServer())
      .post('/resource/createResource')
      .send({ title: 'Delete Resource', description: 'Delete Description' });

    const response = await request(app.getHttpServer())
      .delete(`/resource/deleteResource/${resource.body.data.id}`)
      .expect(200);

    expect(response.body.message).toBe('Resource deleted successfully.');
  });
});
