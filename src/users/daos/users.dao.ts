import mongooseService from '../../common/services/mongoose.service';
import debug from 'debug';
import { CreateUserDto } from '../dto/create.user.dto';
import { PutUserDto } from '../dto/put.user.dto';
import { UserRole } from '../../common/middleware/common.permissionflag.enum';
import isEmail from 'validator/lib/isEmail';
import { PatchUserDto } from '../dto/patch.user.dto';
const log: debug.IDebugger = debug('app:users-dao');

class UsersDao {
    Schema = mongooseService.getMongoose().Schema;

    userSchema = new this.Schema({
        email: {
            type: String,
            required: [true, "Please provide email"],
            unique: [true, 'User with email exist already'],
            validate: [isEmail, 'Please provide valid email']
        },
        password: {
            type: String,
            select: false,
            required: [true, "Please provide password"]
        },
        firstName: {
            type: String,
            required: [true, "Please provide first name"]
        },
        lastName: {
            type: String,
            required: [true, "Please provide last name"]
        },
        role: Number,
        imageUrl: String,
        phoneNumber: String

    }, { timestamps: true });

    User = mongooseService.getMongoose().model('User', this.userSchema);

    constructor() {
        log('Created new instance of UsersDao');
    }

    async addUser(userFields: CreateUserDto) {
        const user = new this.User({
            ...userFields,
            role: UserRole.USER,
        });
        await user.save();
        return user._id;
    }

    async getUserByEmail(email: string) {
        return this.User.findOne({ email: email }).exec();
    }

    async getUserById(userId: string) {
        return this.User.findOne({ _id: userId }).exec();
    }
    

    async getUserByEmailWithPassword(email: string) {
        return this.User.findOne({ email: email })
            .select('_id email role +password')
            .exec();
    }

    async removeUserById(userId: string) {
        return this.User.deleteOne({ _id: userId }).exec();
    }

    async getUsers(limit = 25, page = 0) {
        return this.User.find()
            .limit(limit)
            .skip(limit * page)
            .exec();
    }

    async updateUserById(
        userId: string,
        userFields: PatchUserDto | PutUserDto
    ) {
        const existingUser = await this.User.findOneAndUpdate(
            { _id: userId },
            { $set: userFields },
            { new: true }
        ).exec();

        return existingUser;
    }
}

export default new UsersDao();
