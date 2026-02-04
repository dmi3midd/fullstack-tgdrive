import { IUser } from "../models/user.model";

export class UserDto {
    email: string;
    id: string;
    constructor(model: IUser) {
        this.email = model.email;
        this.id = model._id.toString();
    }
}