import { createSlice } from '@reduxjs/toolkit';

import { RootState } from './types';

const initialState: RootState = {};

const mainSlice = createSlice({
  name: 'main',
  initialState: initialState,
  reducers: {},
});

export default mainSlice;
