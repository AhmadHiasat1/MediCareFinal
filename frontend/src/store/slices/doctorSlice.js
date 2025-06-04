import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3000/api';

// Get all doctors
export const getDoctors = createAsyncThunk(
  'doctor/getDoctors',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/doctors`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get doctor by ID
export const getDoctor = createAsyncThunk(
  'doctor/getDoctor',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/doctors/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update doctor profile
export const updateDoctor = createAsyncThunk(
  'doctor/updateDoctor',
  async ({ id, data }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(`${API_URL}/doctors/${id}`, data, config);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get doctor's time slots
export const getDoctorTimeSlots = createAsyncThunk(
  'doctor/getTimeSlots',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/doctors/${id}/time-slots`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create time slot
export const createTimeSlot = createAsyncThunk(
  'doctor/createTimeSlot',
  async ({ id, data }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(`${API_URL}/doctors/${id}/time-slots`, data, config);
      toast.success('Time slot created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update time slot
export const updateTimeSlot = createAsyncThunk(
  'doctor/updateTimeSlot',
  async ({ doctorId, slotId, data }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(
        `${API_URL}/doctors/${doctorId}/time-slots/${slotId}`,
        data,
        config
      );
      toast.success('Time slot updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete time slot
export const deleteTimeSlot = createAsyncThunk(
  'doctor/deleteTimeSlot',
  async ({ doctorId, slotId }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(
        `${API_URL}/doctors/${doctorId}/time-slots/${slotId}`,
        config
      );
      toast.success('Time slot deleted successfully');
      return slotId;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  doctors: [],
  selectedDoctor: null,
  timeSlots: [],
  isLoading: false,
  error: null
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all doctors
      .addCase(getDoctors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors = action.payload;
      })
      .addCase(getDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get doctor by ID
      .addCase(getDoctor.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(getDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update doctor profile
      .addCase(updateDoctor.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get time slots
      .addCase(getDoctorTimeSlots.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDoctorTimeSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeSlots = action.payload;
      })
      .addCase(getDoctorTimeSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create time slot
      .addCase(createTimeSlot.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTimeSlot.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeSlots.push(action.payload);
      })
      .addCase(createTimeSlot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update time slot
      .addCase(updateTimeSlot.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTimeSlot.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeSlots = state.timeSlots.map((slot) =>
          slot.id === action.payload.id ? action.payload : slot
        );
      })
      .addCase(updateTimeSlot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete time slot
      .addCase(deleteTimeSlot.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTimeSlot.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeSlots = state.timeSlots.filter(
          (slot) => slot.id !== action.payload
        );
      })
      .addCase(deleteTimeSlot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { reset } = doctorSlice.actions;
export default doctorSlice.reducer; 