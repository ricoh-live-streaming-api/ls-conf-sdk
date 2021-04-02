import { createSlice } from '@reduxjs/toolkit';

import { RootState } from './types';

const initialState: RootState = {};

const mainSlice = createSlice({
  name: 'main',
  initialState: initialState,
  reducers: {},
});

// const { actions } = mainSlice;

// export const {} = actions;
// default で slice を export
export default mainSlice;
