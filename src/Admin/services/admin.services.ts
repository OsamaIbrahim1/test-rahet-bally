import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { JwtService } from "@nestjs/jwt";
import { Admin, User } from "../../DB";
import { SignInBodyDTO, SignUpBodyDTO } from "../../DTO";
import * as bcrypt from "bcryptjs";
import * as env from '../../config';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Admin) 
        private adminModel: typeof Admin,
        @InjectModel(User)
        private userModel: typeof User,
        private jwtService: JwtService,
    ) { }

    //=========================== signUp ===========================//
    /**
     * * destructuring data from body
     * * check if email already exists
     * * check if email already exists in user table
     * * hash password
     * * create token
     * * create admin object
     * * create new admin
     */
    async SignUp(body: SignUpBodyDTO) {
        try {
            // * destructuring data from body
            const { email, password, name, role } = body;
            // * check if email already exists in admin table
            const admin = await this.adminModel.findOne({ where: { email } });
            if (admin) {
                throw new BadRequestException({ message: 'email already exist.', status: 400 },);
            }

            // * check if email already exists in user table
            const isAdminExist = await this.userModel.findOne({ where: { email } });
            if (isAdminExist) {
                throw new BadRequestException({ message: 'this email is already exist.', status: 400 },);
            }

            // * hash password 
            const hashedPassword = bcrypt.hashSync(password, env.SALT_ROUNDS);
            if (!hashedPassword) {
                throw new BadRequestException({ message: 'Password not hashed', status: 400 });
            }

            // * create token
            const token = this.jwtService.sign({ email, name, role }, { secret: env.SECRET_LOGIN_TOKEN, expiresIn: env.TIME_EXPIRE_TOKEN });
            if (!token) {
                throw new BadRequestException({ message: 'Token not created', status: 400 });
            }

            // * admin object 
            const adminObj = {
                email,
                password: hashedPassword,
                name,
                role,
                token
            }

            // * create new admin 
            const newAdmin = await this.adminModel.create(adminObj);
            if (!newAdmin) {
                throw new BadRequestException({ message: 'admin not created.', status: 400 });
            }

            return newAdmin;
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

    //=========================== signIn ===========================//
    /**
     * * destructuring data from body
     * * check if email already exists
     * * compare password
     * * create token
     * * update token   
     */
    async SignIn(body: SignInBodyDTO) {
        try {
            // * destructuring data from body
            const { email, password } = body;
            // * check if email already exists
            const admin = await this.adminModel.findOne({ where: { email } });
            if (!admin) {
                throw new BadRequestException({ message: 'email not found.', status: 400 });
            }

            // * compare password
            const comparePassword = bcrypt.compareSync(password, admin.password);
            if (!comparePassword) {
                throw new BadRequestException({ message: 'Password not match.', status: 400 });
            }

            // * create token
            const token = this.jwtService.sign({ email, id: admin.id, role: admin.role }, { secret: env.SECRET_LOGIN_TOKEN, expiresIn: env.TIME_EXPIRE_TOKEN });
            if (!token) {
                throw new BadRequestException({ message: 'Token not created', status: 400 });
            }

            // * update token
            admin.token = token;
            await admin.save();

            return admin.token;
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

}