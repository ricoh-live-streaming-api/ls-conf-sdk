import './Login.css';

import React, { useState } from 'react';

import LoginEntranceFormFieldGroup from '@/components/LoginEntranceFormFieldGroup';

const Login: React.FC<{}> = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const onSubmitSuccess = (): void => {
    window.open(`/room/${roomId}/?username=${username}`);
  };
  return (
    <div className="start-layout">
      <LoginEntranceFormFieldGroup username={username} roomId={roomId} onChangeRoomId={setRoomId} onChangeUsername={setUsername} onSubmitSuccess={onSubmitSuccess} />
    </div>
  );
};

export default Login;
