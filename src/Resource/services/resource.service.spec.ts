import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ResourceService } from './resource.services';
import { Resource } from '../../DB';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import *as env from '../../config'
import { Model } from 'sequelize-typescript';

jest.mock('cloudinary');

describe('ResourceService', () => {
    let service: ResourceService;
    let resourceModel: typeof Resource;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResourceService,
                {
                    provide: getModelToken(Resource),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ResourceService>(ResourceService);
        resourceModel = module.get<typeof Resource>(getModelToken(Resource));
    });
    describe('createResource', () => {
        it('should create a new resource', async () => {
            const mockReq = { body: { title: 'Test', description: 'Test desc' }, authUser: { id: 1 } };
            const mockBody = { title: 'Test', description: 'Test desc' };
            const mockFile = { path: 'test/path' };
            const mockCloudinaryResponse = { secure_url: 'url', public_id: 'publicId' };

            (resourceModel.findOne as jest.Mock).mockResolvedValue(null);
            (resourceModel.create as jest.Mock).mockResolvedValue(mockBody);
            (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockCloudinaryResponse);

            const result = await service.createResource(mockReq, mockBody, mockFile);
            expect(result).toEqual(mockBody);
            expect(resourceModel.findOne).toHaveBeenCalledWith({ where: { title: 'Test' } });
            expect(resourceModel.create).toHaveBeenCalled();
        });

        it('should throw an error if resource already exists', async () => {
            const mockReq = { body: { title: 'Noon', description: 'Test desc' }, authUser: { id: 1 } };
            (resourceModel.findOne as jest.Mock).mockResolvedValue({});

            await expect(service.createResource(mockReq, mockReq.body, {})).rejects.toThrow(HttpException);
        });

        it('should throw an internal server error if something goes wrong', async () => {
            const mockReq = { body: { title: 'Test', description: 'Test desc' }, authUser: { id: 1 } };
            (resourceModel.findOne as jest.Mock).mockResolvedValue(null);
            (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(new Error('Upload error'));

            await expect(service.createResource(mockReq, mockReq.body, {})).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteResource', () => {
        it('should delete a resource', async () => {
            const req = {
                params: { resourceId: '1' },
                authUser: { id: 'adminId' },
            };
            const resource = { id: '1', adminId: 'adminId' };

            jest.spyOn(resourceModel, 'findOne').mockResolvedValue(Promise.resolve(resource as unknown as Model<any, any>));
            jest.spyOn(resourceModel, 'destroy').mockResolvedValue(Promise.resolve(1) as Promise<number>);
            jest.spyOn(cloudinary.api, 'delete_resources_by_prefix').mockResolvedValue({});
            jest.spyOn(cloudinary.api, 'delete_folder').mockResolvedValue({});

            const result = await service.deleteResource(req);

            expect(resourceModel.findOne).toHaveBeenCalledWith({
                where: { id: '1', adminId: 'adminId' },
            });
            expect(cloudinary.api.delete_resources_by_prefix).toHaveBeenCalledWith(`${env.MAIN_FOLDER}/resources/folderId`);
            expect(cloudinary.api.delete_folder).toHaveBeenCalledWith(`${env.MAIN_FOLDER}/resources/folderId`);
            expect(resourceModel.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toBe(true);
        });

        it('should throw NotFoundException if resource is not found', async () => {
            const req = {
                params: { resourceId: '1' },
                authUser: { id: 'adminId' },
            };

            jest.spyOn(resourceModel, 'findOne').mockResolvedValue(null);

            await expect(service.deleteResource(req)).rejects.toThrow(HttpException);
        });

        it('should handle unexpected errors', async () => {
            const req = {
                params: { resourceId: '1' },
                authUser: { id: 'adminId' },
            };

            jest.spyOn(resourceModel, 'findOne').mockRejectedValue(new Error('Unexpected error'));

            await expect(service.deleteResource(req)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('updateResource', () => {
        it('should update the resource title and description', async () => {
            const req = {
                params: { resourceId: '1' },
                authUser: { id: 'adminId' },
                file: {},
            };
            const body = { title: 'New Title', description: 'New Description', oldPublicId: 'publicId' };
            const resource = { id: '1', folderId: 'folderId', description: 'New Description', title: 'New Title', save: jest.fn() };
        
            jest.spyOn(resourceModel, 'findOne').mockResolvedValue(Promise.resolve(resource as unknown as Model<any, any>));
        
            await expect(service.updateResource(req, body)).resolves.toBe(resource);
        });

        it('should throw NotFoundException if resource is not found', async () => {
            const req = {
                params: { resourceId: '1' },
                authUser: { id: 'adminId' },
                file: {},
            };
            const body = { title: 'New Title', description: 'New Description', oldPublicId: 'publicId' };
        
            jest.spyOn(resourceModel, 'findOne').mockResolvedValue(null);
        
            await expect(service.updateResource(req, body)).rejects.toThrow(new HttpException('Resource not found', HttpStatus.NOT_FOUND));
        });

        it('should handle unexpected errors', async () => {
            const req = {
                params: { resourceId: '1' },
                authUser: { id: 'adminId' },
                file: {},
            };
            const body = { title: 'New Title', description: 'New Description', oldPublicId: 'publicId' };

            jest.spyOn(resourceModel, 'findOne').mockRejectedValue(new Error('Unexpected error'));

            await expect(service.updateResource(req, body)).rejects.toThrow(InternalServerErrorException);
        });
    });

});