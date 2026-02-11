import { Model } from 'mongoose';
import { Folder, IFolder } from '../models/folder.model';
import { BaseRepository } from './base.repository';

export class FolderRepository extends BaseRepository<IFolder> {
    protected model: Model<IFolder> = Folder;
}

export default new FolderRepository();
