import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { v2 as cloudinary } from 'cloudinary'
import { Resource } from "../../DB";
import UniqueString from '../../utils/generate-Unique-String'
import * as env from '../../config';
import { CreateResource, UpdateResource } from "../../DTO";

@Injectable()
export class ResourceService {
    constructor(
        @InjectModel(Resource)
        private resourceModel: typeof Resource
    ) {
        cloudinary.config({
            cloud_name: env.CLOUD_NAME,
            api_key: env.API_KEY,
            api_secret: env.API_SECRET,
        });
    }

    //================================== Create Resource ==================================//
    /**
     * * destructuring data from body
     * * destructuring data from headers
     * * check if title already exists
     * * check if file uploaded
     * * create resource object
     * * create new resource
     */
    async createResource(req: any, body: CreateResource, file: any) {
        try {
            // * destructuring data from body
            const { title, description } = req.body;
            // * destructuring data from headers
            const { id } = req.authUser
            // * check if title already exists
            const checkTitle = await this.resourceModel.findOne({ where: { title } });
            if (checkTitle) {
                throw new BadRequestException({ message: 'Resource already exists.', status: 400 });
            }
            // * check if file uploaded
            const folderId = UniqueString.generateUniqueString(5)
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `${env.MAIN_FOLDER}/resources/${folderId}`,
            });

            // * create resource object
            const resourceObj = {
                title,
                description,
                Image: [{ secure_url, public_id }],
                folderId,
                adminId: id,

            }

            // * create new resource
            const newResource = await this.resourceModel.create(resourceObj);
            if (!newResource) {
                throw new BadRequestException({ message: 'Resource not created.', status: 400 });
            }

            return newResource;
        } catch (err) {
            if (!err['response']) {
                throw new InternalServerErrorException({
                    message: 'An unexpected error occurred.',
                    status: 500,
                    timestamp: new Date().toISOString(),
                    error: err.message || 'Unknown error'
                });
            }
            throw new HttpException({
                error: err['response'].message,
                status: err['response'].status,
                timestamp: new Date().toISOString()
            }, err['response'].status, {
                cause: err
            });
        }
    }

    //================================== Delete Resource ==================================//
    /**
     * * destructuring data from params
     * * destructuring data from headers
     * * check if resource exists
     * * delete resource from cloudinary
     * * delete resource from database
     */
    async deleteResource(req: any) {
        try {
            // * destructuring data from params
            const { resourceId } = req.params;
            // * destructuring data from headers
            const { id: adminId } = req.authUser
            // * check if resource exists
            const resource = await this.resourceModel.findOne({ where: { id: resourceId, adminId } });
            if (!resource) {
                throw new NotFoundException({ message: 'Resource not found.', status: 400 });
            }

            if (resource.folderId) {
                // * delete resource from cloudinary
                await cloudinary.api.delete_resources_by_prefix(
                    `${env.MAIN_FOLDER}/resources/${resource.folderId}`
                );
                await cloudinary.api.delete_folder(
                    `${env.MAIN_FOLDER}/resources/${resource.folderId}`
                );
            }

            // * delete resource from database
            await this.resourceModel.destroy({ where: { id: resourceId } });

            return true;
        } catch (err) {
            if (!err['response']) {
                throw new InternalServerErrorException({
                    message: 'An unexpected error occurred.',
                    status: 500,
                    timestamp: new Date().toISOString(),
                    error: err.message || 'Unknown error'
                });
            } throw new HttpException({
                error: err['response'].message,
                status: err['response'].status,
                timestamp: new Date().toISOString()
            }, err['response'].status, {
                cause: err
            });
        }
    }

    //================================== update resource ==================================//
    /**
     * * destructuring data from body
     * * destructuring data from params
     * * destructuring data from headers
     * * check if resource exists
     * * if admin want to update title
     * * check if title already exists
     * * update title
     * * if admin want to update description
     * * update description
     * * if admin wants to update the image
     * * update image and use same public id  and folder id
     * * save updated resource
     */
    async updateResource(req: any, body: UpdateResource) {
        try {
            // * destructuring data from body
            const { title, description, oldPublicId } = body;
            // * destructuring data from params
            const { resourceId } = req.params;
            // * destructuring data from headers
            const { id: adminId } = req.authUser

            // * check if resource exists
            const resource = await this.resourceModel.findOne({ where: { id: resourceId, adminId } });
            if (!resource) {
                throw new NotFoundException({ message: 'Resource not found.', status: 400 });
            }

            // * if admin want to update title
            if (title) {
                // * check if title already exists
                const checkTitle = await this.resourceModel.findOne({ where: { title } });
                if (checkTitle) {
                    throw new BadRequestException({ message: 'title already exists, enter another title.', status: 400 });
                }

                // * update title
                resource.title = title;
            }

            // * if admin want to update description
            if (description) {
                // * update description
                resource.description = description;
            }

            // * if admin wants to update the image
            if (oldPublicId) {
                if (!req.file.path) {
                    throw new BadRequestException('Please upload image')
                }

                const newPublicId = oldPublicId.split(`${resource.folderId}/`)[1];

                // * update image and use same public id  and folder id
                const { secure_url, public_id } =
                    await cloudinary.uploader.upload(req.file.path, {
                        folder: `${env.MAIN_FOLDER}/resources/${resource.folderId}`,
                        public_id: newPublicId,
                    });
                resource.Image = [{ secure_url, public_id }];
            }

            // * save updated resource
            await resource.save();

            return resource;
        } catch (err) {
            if (!err['response']) {
                throw new InternalServerErrorException({
                    message: 'An unexpected error occurred.',
                    status: 500,
                    timestamp: new Date().toISOString(),
                    error: err.message || 'Unknown error'
                });
            }
            throw new HttpException({
                error: err['response'].message,
                status: err['response'].status,
                timestamp: new Date().toISOString()
            }, err['response'].status, {
                cause: err
            });
        }
    }

    //================================== get all resources ==================================//
    /**
     * * destructure data from query
     * * find data and paginate it
     * * return resources
     */
    async getAllResources(req: any) {
        try {
            //  * destructure data from query
            const { page, limit } = req.query;

            // * find data and paginate it
            const offset = (+page - 1) * +limit;

            const resources = await this.resourceModel.findAndCountAll({
                limit: parseInt(limit),
                offset,
            });

            return resources;
        } catch (err) {
            if (!err['response']) {
                throw new InternalServerErrorException({
                    message: 'An unexpected error occurred.',
                    status: 500,
                    timestamp: new Date().toISOString(),
                    error: err || 'Unknown error'
                });
            }
            throw new HttpException({
                error: err['response'].message,
                status: err['response'].status,
                timestamp: new Date().toISOString()
            }, err['response'].status, {
                cause: err
            });
        }
    }

    //==================================== search for resources =============================//
    async searchForResources(req: any) {
        try {
            // * destructure data from query
            const { search } = req.query

            // * search for resource
            const resources = await this.resourceModel.findOne({
                where: {
                    title: search
                }
            })
            if (!resources) {
                throw new NotFoundException({ message: 'Resource not found.', status: 400 });
            }

            return resources
        } catch (err) {
            if (!err['response']) {
                throw new InternalServerErrorException({
                    message: 'An unexpected error occurred.',
                    status: 500,
                    timestamp: new Date().toISOString(),
                    error: err || 'Unknown error'
                });
            }
            throw new HttpException({
                error: err['response'].message,
                status: err['response'].status,
                timestamp: new Date().toISOString()
            }, err['response'].status, {
                cause: err
            });
        }
    }
}
