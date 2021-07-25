import './Login.css';

import React, { useState } from 'react';

import LoginEntranceFormFieldGroup from '@/components/LoginEntranceFormFieldGroup';

const Login: React.FC<Record<string, never>> = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const onSubmitSuccess = (): void => {
    const encodedUsername = encodeURIComponent(username);
    window.open(`/room/${roomId}/?username=${encodedUsername}`);
  };
  return (
    <div className="start-layout">
      <LoginEntranceFormFieldGroup username={username} roomId={roomId} onChangeRoomId={setRoomId} onChangeUsername={setUsername} onSubmitSuccess={onSubmitSuccess} />
    </div>
  );
};

export default Login;
