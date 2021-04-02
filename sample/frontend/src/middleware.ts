import { getDefaultMiddleware } from '@reduxjs/toolkit';

const middleware = [
  ...getDefaultMiddleware({
    serializableCheck: {
      // immutable な state は main.immutable プロパティに押し込めて、serializable check を切る
      ignoredPaths: [],
      // action payload が MediaStream など immutable な場合は個別に action を ignore する
      ignoredActions: [],
    },
    immutableCheck: {
      // immutable な state は main.immutable プロパティに押し込めて、そこだけ immutable check を切る
      ignoredPaths: [],
    },
  }),
];

export default middleware;
