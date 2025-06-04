import { Prescription } from '../models/prescription.model.js';
import { Doctor } from '../models/doctor.model.js';
import { User } from '../models/user.model.js';

// Get patient's prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.params.id },
      include: [
        {
          model: Doctor,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching prescriptions'
    });
  }
};

// Create prescription
export const createPrescription = async (req, res) => {
  try {
    const { patientId, medications, instructions, notes } = req.body;
    
    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user.profile.id, // Current logged in doctor
      medications,
      instructions,
      notes
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating prescription'
    });
  }
};

// Get single prescription
export const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      where: { id: req.params.prescriptionId },
      include: [
        {
          model: Doctor,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });

    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found'
      });
    }

    // Check if user has permission to view this prescription
    if (req.user.role === 'patient' && prescription.patientId !== req.user.profile.id) {
      return res.status(403).json({
        error: 'Not authorized to view this prescription'
      });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching prescription'
    });
  }
}; 
import { Doctor } from '../models/doctor.model.js';
import { User } from '../models/user.model.js';

// Get patient's prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.params.id },
      include: [
        {
          model: Doctor,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching prescriptions'
    });
  }
};

// Create prescription
export const createPrescription = async (req, res) => {
  try {
    const { patientId, medications, instructions, notes } = req.body;
    
    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user.profile.id, // Current logged in doctor
      medications,
      instructions,
      notes
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating prescription'
    });
  }
};

// Get single prescription
export const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      where: { id: req.params.prescriptionId },
      include: [
        {
          model: Doctor,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });

    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found'
      });
    }

    // Check if user has permission to view this prescription
    if (req.user.role === 'patient' && prescription.patientId !== req.user.profile.id) {
      return res.status(403).json({
        error: 'Not authorized to view this prescription'
      });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching prescription'
    });
  }
}; 
 