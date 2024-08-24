import { Test, TestingModule } from '@nestjs/testing';
import { ResourceController } from './resource.controller';
import { ResourceService } from '../services';
import { CreateResource } from '../../DTO';
import { RolesGuard } from '../../Guards';
import { AuthGuard } from '../../Guards/auth.guard';

describe('ResourceController', () => {
    let controller: ResourceController;
    let service: ResourceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ResourceController],
            providers: [
                {
                    provide: ResourceService,
                    useValue: {
                        createResource: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({})
            .overrideGuard(AuthGuard)
            .useValue({})
            .compile();

        controller = module.get<ResourceController>(ResourceController);
        service = module.get<ResourceService>(ResourceService);
    });

    it('should create a resource and return success', async () => {
        const mockReq = { authUser: { id: 1 } } as any;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
        const mockCreateResource = new CreateResource();
        const mockFile = {} as any;

        (service.createResource as jest.Mock).mockResolvedValue(mockCreateResource);

        await controller.createResource(mockFile, mockReq, mockCreateResource, mockRes);

        expect(service.createResource).toHaveBeenCalledWith(mockReq, mockCreateResource, mockFile);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Resource created successfully.', data: mockCreateResource });
    });
});
