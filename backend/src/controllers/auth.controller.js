import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { transaction, findByField, query } from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medicare_super_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, ...profileData } = req.body;

    const existingUser = await findByField('users', 'email', email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await transaction(async (client) => {
      const userQuery = `
        INSERT INTO users (email, password, first_name, last_name, phone, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const userValues = [email, hashedPassword, firstName, lastName, phone, role];
      const user = (await client.query(userQuery, userValues)).rows[0];

      let profile;
      if (role === 'doctor') {
        const { specialization, qualifications, experience, consultationFee, about } = profileData;
        const doctorQuery = `
          INSERT INTO doctors (user_id, specialization, qualifications, experience, consultation_fee, about)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        const doctorValues = [user.id, specialization, qualifications, experience, consultationFee, about];
        profile = (await client.query(doctorQuery, doctorValues)).rows[0];
      } else if (role === 'patient') {
        const { dateOfBirth, gender, bloodGroup, address } = profileData;
        const patientQuery = `
          INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const patientValues = [user.id, dateOfBirth, gender, bloodGroup, address];
        profile = (await client.query(patientQuery, patientValues)).rows[0];
      }

      return { user, profile };
    });

    const token = generateToken(result.user);

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        role: result.user.role,
        profile: result.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = `
      SELECT u.*, 
        CASE 
          WHEN u.role = 'doctor' THEN json_build_object(
            'id', d.id,
            'specialization', d.specialization,
            'qualifications', d.qualifications,
            'experience', d.experience,
            'consultationFee', d.consultation_fee,
            'about', d.about,
            'availableDays', d.available_days,
            'workingHours', d.working_hours
          )
          WHEN u.role = 'patient' THEN json_build_object(
            'id', p.id,
            'dateOfBirth', p.date_of_birth,
            'gender', p.gender,
            'bloodGroup', p.blood_group,
            'address', p.address
          )
        END as profile
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id AND u.role = 'doctor'
      LEFT JOIN patients p ON u.id = p.user_id AND u.role = 'patient'
      WHERE u.email = $1
    `;
    const user = await findByField('users', 'email', email);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Your account has been deactivated'
      });
    }

    const profileData = (await query(userQuery, [email]))[0];

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        profile: profileData.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userQuery = `
      SELECT u.*, 
        CASE 
          WHEN u.role = 'doctor' THEN json_build_object(
            'id', d.id,
            'specialization', d.specialization,
            'qualifications', d.qualifications,
            'experience', d.experience,
            'consultationFee', d.consultation_fee,
            'about', d.about,
            'availableDays', d.available_days,
            'workingHours', d.working_hours
          )
          WHEN u.role = 'patient' THEN json_build_object(
            'id', p.id,
            'dateOfBirth', p.date_of_birth,
            'gender', p.gender,
            'bloodGroup', p.blood_group,
            'address', p.address
          )
        END as profile
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id AND u.role = 'doctor'
      LEFT JOIN patients p ON u.id = p.user_id AND u.role = 'patient'
      WHERE u.id = $1
    `;
    
    const userData = (await query(userQuery, [userId]))[0];

    if (!userData) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        profile: userData.profile
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(400).json({
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      specialization,
      qualifications,
      experience,
      consultationFee,
      about,
      dateOfBirth,
      gender,
      bloodGroup,
      address
    } = req.body;

    const result = await transaction(async (client) => {
      const userQuery = `
        UPDATE users 
        SET first_name = $1, last_name = $2, phone = $3
        WHERE id = $4
        RETURNING *
      `;
      const user = (await client.query(userQuery, [
        firstName,
        lastName,
        phone,
        req.user.id
      ])).rows[0];

      let profile;
      if (req.user.role === 'doctor') {
        const doctorQuery = `
          UPDATE doctors 
          SET specialization = $1, qualifications = $2, experience = $3, consultation_fee = $4, about = $5
          WHERE user_id = $6
          RETURNING *
        `;
        profile = (await client.query(doctorQuery, [
          specialization,
          qualifications,
          experience,
          consultationFee,
          about,
          req.user.id
        ])).rows[0];
      } else if (req.user.role === 'patient') {
        const patientQuery = `
          UPDATE patients 
          SET date_of_birth = $1, gender = $2, blood_group = $3, address = $4
          WHERE user_id = $5
          RETURNING *
        `;
        profile = (await client.query(patientQuery, [
          dateOfBirth,
          gender,
          bloodGroup,
          address,
          req.user.id
        ])).rows[0];
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role,
          profile
        }
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({
      error: error.message
    });
  }
}; 