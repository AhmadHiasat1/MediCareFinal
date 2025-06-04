import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

// Get appointments
export const getAppointments = createAsyncThunk(
  'appointments/getAppointments',
  async ({ doctorId, date, status }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      let url = `${API_URL}/appointments`;
      const params = new URLSearchParams();
      
      if (doctorId) params.append('doctorId', doctorId);
      if (date) params.append('date', date);
      if (status) params.append('status', status);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointments');
    }
  }
);

// Add prescription
export const addPrescription = createAsyncThunk(
  'appointments/addPrescription',
  async ({ appointmentId, prescriptionData }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      const response = await axios.post(
        `${API_URL}/appointments/${appointmentId}/prescription`,
        prescriptionData,
        config
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add prescription');
    }
  }
);

// Get appointment by ID
export const getAppointment = createAsyncThunk(
  'appointment/getAppointment',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(`${API_URL}/appointments/${id}`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update appointment status (doctor only)
export const updateAppointmentStatus = createAsyncThunk(
  'appointment/updateStatus',
  async ({ id, data }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(
        `${API_URL}/appointments/${id}/status`,
        data,
        config
      );
      toast.success('Appointment status updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get appointments
      .addCase(getAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Get appointment by ID
      .addCase(getAppointment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(getAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = state.appointments.map((appointment) =>
          appointment.id === action.payload.id ? action.payload : appointment
        );
        if (state.selectedAppointment?.id === action.payload.id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add prescription
      .addCase(addPrescription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPrescription.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the appointment with the new prescription
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        toast.success('Prescription added successfully');
      })
      .addCase(addPrescription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { reset, clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer; 