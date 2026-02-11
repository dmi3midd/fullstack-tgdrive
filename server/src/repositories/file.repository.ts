import { Model } from 'mongoose';
import { File, IFile } from '../models/file.model';
import { BaseRepository } from './base.repository';

export class FileRepository extends BaseRepository<IFile> {
    protected model: Model<IFile> = File;
}

export default new FileRepository();
