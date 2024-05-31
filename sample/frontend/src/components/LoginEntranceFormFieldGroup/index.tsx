import './LoginEntranceFormFieldGroup.css';
import '@material/theme/dist/mdc.theme.css';
import '@material/typography/dist/mdc.typography.css';
import '@material/card/dist/mdc.card.css';
import '@material/textfield/dist/mdc.textfield.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/button/dist/mdc.button.css';

import { TextField } from '@rmwc/textfield';
import { ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';

// MWCのバグが、以下2つあるため一時的に指定している
// TextFieldの色はprimary値しか受け付けない / ラベルの色はthemeやclassを使っても、強制的に#6200eeの値になる
// TODO(hkt): RMWC側でバグが対応され次第削除する
const TEXTFIELD_THEME_OPTIONS = {
  primary: '#6200ee',
};

const ROOMID_CHARACTER_LIMIT = {
  upper: 255,
};

const USERNAME_CHARACTER_LIMIT = {
  upper: 10,
};

const validateIDString = (idString: string): boolean => {
  const pattern = /^[a-zA-Z0-9.%+^_"`{|}~<>\\-]{1,255}$/;
  return idString.match(pattern) !== null;
};

// username / roomId のバリデーション
const validateRoomIdAndUsername = (roomId: string, username: string): Array<{ key: string; message: string }> => {
  const errors = [];
  if (username === '') {
    errors.push({ key: 'username', message: 'ユーザ名を入力してください' });
  }
  if (username.length > USERNAME_CHARACTER_LIMIT.upper) {
    errors.push({ key: 'username', message: `ユーザ名は${USERNAME_CHARACTER_LIMIT.upper}文字以下で入力してください` });
  }
  if (roomId === '') {
    errors.push({ key: 'roomId', message: 'ルーム名を入力してください' });
  }
  if (roomId.length > ROOMID_CHARACTER_LIMIT.upper) {
    errors.push({ key: 'roomId', message: `ルーム名は${ROOMID_CHARACTER_LIMIT.upper}文字以下で入力してください` });
  }
  if (!validateIDString(roomId)) {
    errors.push({ key: 'roomId', message: '英数字と一部記号（.%+^_"`{|}~<>\\-）以外の文字列は使用できません' });
  }
  return errors;
};

interface LoginEntranceInputItemProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  name: string;
  value: string;
  validateErrors: Array<{ key: string; message: string }>;
}

const LoginEntranceInputItem: React.FC<LoginEntranceInputItemProps> = (props) => {
  const error = props.validateErrors.find((v) => v.key === props.name);
  const helpText = error && {
    persistent: true,
    validationMsg: true,
    children: error.message,
  };
  const isInvalid = error !== undefined;
  const title = `${props.label}を入力してください`;
  return (
    <>
      <Typography use="body1" tag="p" theme="textSecondaryOnBackground">
        {title}
      </Typography>
      <ThemeProvider options={TEXTFIELD_THEME_OPTIONS}>
        <TextField onChange={props.onChange} style={{ width: '100%' }} outlined invalid={isInvalid} label={props.label} name={props.name} value={props.value} helpText={helpText} />
      </ThemeProvider>
    </>
  );
};

interface LoginEntranceFormFieldGroupProps {
  onChangeRoomId: (roomId: string) => void;
  onChangeUsername: (username: string) => void;
  onSubmitSuccess: () => void;
  username: string;
  roomId: string;
}

const LoginEntranceFormFieldGroup: React.FC<LoginEntranceFormFieldGroupProps> = (props) => {
  const [validateErrors, setValidateResult] = useState<Array<{ key: string; message: string }>>([]);
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    const errors = validateRoomIdAndUsername(props.roomId, props.username);
    setValidateResult(errors);
    if (errors.length > 0) {
      return;
    }
    // validation エラーが無い場合ログイン処理を行う
    props.onSubmitSuccess();
  };
  const handleChangeRoomId = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    props.onChangeRoomId(e.target.value);
  };
  const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    props.onChangeUsername(e.target.value);
  };
  return (
    <div className="mdc-card">
      <div className="join-content">
        <Typography use="headline6" tag="h1" theme="onSurface">
          RICOH Live Streaming Conference Sample
        </Typography>
        <form>
          <div className="form-group">
            <LoginEntranceInputItem onChange={handleChangeRoomId} label="ルーム名" name="roomId" value={props.roomId} validateErrors={validateErrors} />
            <LoginEntranceInputItem onChange={handleChangeUsername} label="ユーザ名" name="username" value={props.username} validateErrors={validateErrors} />
          </div>
          <button id="joinButton" onClick={handleSubmit} className="mdc-button mdc-button--raised mdco-fullwidth">
            <div className="mdc-button__ripple"></div>
            <span className="mdc-button__label">参加</span>
          </button>
        </form>
      </div>
    </div>
  );
};
export default LoginEntranceFormFieldGroup;
