import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

// Get patient profile
export const getPatient = createAsyncThunk(
  'patient/getPatient',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(`${API_URL}/patients/${id}`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update patient profile
export const updatePatient = createAsyncThunk(
  'patient/updatePatient',
  async ({ id, data }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(`${API_URL}/patients/${id}`, data, config);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get patient's appointments
export const getPatientAppointments = createAsyncThunk(
  'patient/getAppointments',
  async ({ id, params }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(
        `${API_URL}/patients/${id}/appointments`,
        { ...config, params }
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Book appointment
export const bookAppointment = createAsyncThunk(
  'patient/bookAppointment',
  async ({ doctorId, ...appointmentData }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(
        `${API_URL}/appointments`,
        { doctorId, ...appointmentData },
        config
      );
      toast.success('Appointment booked successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Cancel appointment
export const cancelAppointment = createAsyncThunk(
  'patient/cancelAppointment',
  async ({ patientId, appointmentId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/patients/${patientId}/appointments/${appointmentId}/cancel`,
        { reason }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update patient profile
export const updatePatientProfile = createAsyncThunk(
  'patient/updateProfile',
  async ({ id, data }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(
        `${API_URL}/patients/${id}`,
        data,
        config
      );
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get doctors list
export const getDoctors = createAsyncThunk(
  'patient/getDoctors',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(`${API_URL}/doctors`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get doctor details
export const getDoctorDetails = createAsyncThunk(
  'patient/getDoctorDetails',
  async (doctorId, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(`${API_URL}/doctors/${doctorId}`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get patient prescriptions
export const getPatientPrescriptions = createAsyncThunk(
  'patient/getPrescriptions',
  async (patientId, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(
        `${API_URL}/patients/${patientId}/prescriptions`,
        config
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  profile: null,
  appointments: [],
  doctors: [],
  selectedDoctor: null,
  prescriptions: [],
  isLoading: false,
  error: null,
  successMessage: null
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get patient profile
      .addCase(getPatient.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(getPatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update patient profile
      .addCase(updatePatient.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get patient appointments
      .addCase(getPatientAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPatientAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(getPatientAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Book appointment
      .addCase(bookAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = [...state.appointments, action.payload];
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cancel appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = state.appointments.map((appointment) =>
          appointment.id === action.payload.id ? action.payload : appointment
        );
        state.successMessage = 'Appointment cancelled successfully';
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to cancel appointment';
      })
      // Update Profile
      .addCase(updatePatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = 'Profile updated successfully';
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })
      // Get Doctors
      .addCase(getDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors = action.payload;
      })
      .addCase(getDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Doctor Details
      .addCase(getDoctorDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDoctorDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(getDoctorDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Patient Prescriptions
      .addCase(getPatientPrescriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPatientPrescriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prescriptions = action.payload;
      })
      .addCase(getPatientPrescriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { reset, clearError, clearSuccessMessage } = patientSlice.actions;
export default patientSlice.reducer; 