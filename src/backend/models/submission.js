import knex from 'knex';
import { validate } from '../../common/schemas/submission.js';
import { UnprocessableError } from '../../common/errors.js';

export default class SubManager {
  constructor(db) {
    this._db = db;
  }

  async create(submission) {
    try {
      await validate(submission);
    } catch (err) {
      throw new UnprocessableError('Failed to create submission: ', err);
    }
    return this._db
      .table('submissions')
      .insert(submission)
      .returning('*');
  }

  async update(id, submission) {
    try {
      await validate(submission);
    } catch (err) {
      throw new UnprocessableError('Failed to update submission: ', err);
    }
    return this._db
      .table('submissions')
      .update(submission)
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('submissions')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'id',
    from: from,
    to: to,
    form: form,
  }) {
    const rows = await this._db
      .table('submissions')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (form) {
          queryBuilder.join(
            'form_submissions',
            'form_submissions.fid',
            knex.raw('?', [form]),
          );
        }

        if (asc) {
          queryBuilder.orderBy(sort_by, 'asc');
        } else {
          queryBuilder.orderBy(sort_by, 'desc');
        }

        if (start > 0) {
          queryBuilder.offset(start);
        }

        if (end && end > start) {
          queryBuilder.limit(end - start);
        }
      });

    return rows || [];
  }

  async findById(id) {
    return this._db
      .table('submissions')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('submissions').select('*');
  }
}