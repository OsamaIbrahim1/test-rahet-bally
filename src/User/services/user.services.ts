import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcryptjs";
import { Admin, User } from "../../DB";
import * as env from '../../config'
import { JwtService } from "@nestjs/jwt";
import { SignInBodyDTO, SignUpBodyDTO } from "../../DTO";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(Admin)
        private adminModel: typeof Admin,
        private jwtService: JwtService,
    ) { }

    //=========================== signUp ===========================//
    /**
     * * destructuring data from body
     * * check if email already exists 
     * * check if email already exists in admin table
     * * hash password
     * * create token
     * * create user object
     * * create new user
     */
    async SignUp(body: SignUpBodyDTO) {
        try {
            // * destructure data from body
            const { email, password, name, role } = body;
            // * check if email already exists
            const user = await this.userModel.findOne({ where: { email } });
            if (user) {
                throw new BadRequestException({ message: 'email already exist.', status: 400 })
            }

            // * check if email already exists in admin table
            const isEmailExist = await this.adminModel.findOne({ where: { email } });
            if (isEmailExist) {
                throw new BadRequestException({ message: 'email already exist.', status: 400 })
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

            // * user object 
            const userObj = {
                email,
                password: hashedPassword,
                name,
                role,
                token
            }

            // * create new user 
            const newUser = await this.userModel.create(userObj);
            if (!newUser) {
                throw new BadRequestException({ message: 'User not created.', status: 400 });
            }

            return newUser;
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
     * * save token
     * * return user
     */
    async SignIn(body: SignInBodyDTO) {
        // * destructure data from body
        const { email, password } = body;
        try {
            // * check if email already exists
            const user = await this.userModel.findOne({ where: { email } });
            if (!user) {
                throw new BadRequestException({ message: 'User not found.', status: 400 });
            }

            // * compare password
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if (!passwordMatch) {
                throw new BadRequestException({ message: 'Password not match.', status: 400 });
            }

            // * create token
            const token = this.jwtService.sign({ email: user.email, id: user.id, role: user.role }, { secret: env.SECRET_LOGIN_TOKEN, expiresIn: env.TIME_EXPIRE_TOKEN });
            if (!token) {
                throw new BadRequestException({ message: 'Token not created', status: 400 });
            }

            // * update token
            user.token = token;

            // * save token
            await user.save();

            return user.token;
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