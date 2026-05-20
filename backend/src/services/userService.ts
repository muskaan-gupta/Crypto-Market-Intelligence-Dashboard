import logger from '../utils/logger';
import { query } from '../utils/db';
import { hashPassword, comparePassword } from '../utils/auth';
import { User } from '../types';

export async function createUser(email: string, password: string): Promise<User> {
  try {
    const hashedPassword = await hashPassword(password);

    const result = await query(
      `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING id, email, created_at, updated_at
      `,
      [email, hashedPassword]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: '', // Don't return the password
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err: any) {
    if (err.code === '23505') {
      throw new Error('Email already exists');
    }
    logger.error('Error creating user', err);
    throw err;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await query(
      `SELECT id, email, password, created_at, updated_at FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    logger.error('Error fetching user by email', err);
    throw err;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const result = await query(
      `SELECT id, email, created_at, updated_at FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    logger.error('Error fetching user by id', err);
    throw err;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return null;
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return null;
    }

    return {
      ...user,
      password: '',
    };
  } catch (err) {
    logger.error('Error authenticating user', err);
    throw err;
  }
}
