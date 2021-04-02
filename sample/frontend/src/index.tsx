import './index.css';
import '@material/theme/dist/mdc.theme.css';

import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@rmwc/theme';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './containers/App';
import middleware from './middleware';
import mainSlice from './slice';

const THEME_PROVIDER_OPTIONS = {
  primary: '#303030',
  background: '#f7f7fa',
  surface: '#fff',
  onPrimary: '#fff',
  secondary: '#661fff',
  error: '#b00020',
  onSecondary: 'rgba(255, 255, 255, 1)',
  onSurface: 'rgba(0, 0, 0, 0.87)',
  onError: '#fff',
  textPrimaryOnBackground: 'rgba(0, 0, 0, 0.87)',
  textSecondaryOnBackground: 'rgba(0, 0, 0, 0.54)',
  textHintOnBackground: 'rgba(0, 0, 0, 0.38)',
  textDisabledOnBackground: 'rgba(0, 0, 0, 0.38)',
  textIconOnBackground: 'rgba(0, 0, 0, 0.38)',
  textPrimaryOnLight: 'rgba(0, 0, 0, 0.87)',
  textSecondaryOnLight: 'rgba(0, 0, 0, 0.54)',
  textHintOnLight: 'rgba(0, 0, 0, 0.38)',
  textDisabledOnLight: 'rgba(0, 0, 0, 0.38)',
  textIconOnLight: 'rgba(0, 0, 0, 0.38)',
  textPrimaryOnDark: 'white',
  textSecondaryOnDark: 'rgba(255, 255, 255, 0.7)',
  textHintOnDark: 'rgba(255, 255, 255, 0.5)',
  textDisabledOnDark: 'rgba(255, 255, 255, 0.5)',
  textIconOnDark: 'rgba(255, 255, 255, 0.5)',
};

const rootElement = document.getElementById('root');
// mobile で 100vh だと アドレスバーからはみでてしまうケースに対応
// onload 時に innerHeight から `--vh` を計算
// 参考: https://dev.to/admitkard/mobile-issue-with-100vh-height-100-100vh-3-solutions-3nae
document.body.onload = () => {
  if (rootElement) {
    rootElement.style.setProperty('--vh', window.innerHeight / 100 + 'px');
  }
};
// window.resize 時に `--vh` を再計算
window.addEventListener('resize', () => {
  // window.innerHeight の変更に追従するため、少し遅延させる
  window.setTimeout(() => {
    if (rootElement) {
      rootElement.style.setProperty('--vh', window.innerHeight / 100 + 'px');
    }
  }, 300);
});

const rootReducer = mainSlice.reducer;

// https://redux.js.org/redux-toolkit/overview#whats-included
// devTools Extention はデフォルトで ON になっている
const store = configureStore({
  reducer: rootReducer,
  middleware: middleware,
});

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider options={THEME_PROVIDER_OPTIONS}>
      <App />
    </ThemeProvider>
  </Provider>,
  rootElement
);
