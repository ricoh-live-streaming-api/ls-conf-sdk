import './Entrance.css';

import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoginEntranceFormFieldGroup from '@/components/LoginEntranceFormFieldGroup';

const Entrance: React.FC<{}> = () => {
  const params: { roomId: string } = useParams();
  // eslint-disable-next-line @typescript-eslint/camelcase
  const { video_bitrate, share_bitrate, default_layout, use_dummy_device } = qs.parse(window.location.search);
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const onSubmitSuccess = (): void => {
    let uriPath = '';
    /* eslint-disable @typescript-eslint/camelcase */
    if (isNaN(Number(video_bitrate)) && isNaN(Number(share_bitrate))) {
      uriPath = `/room/${roomId}/?username=${username}`;
    } else if (isNaN(Number(video_bitrate))) {
      uriPath = `/room/${roomId}/?username=${username}&share_bitrate=${share_bitrate}`;
    } else if (isNaN(Number(share_bitrate))) {
      uriPath = `/room/${roomId}/?username=${username}&video_bitrate=${video_bitrate}`;
    } else {
      uriPath = `/room/${roomId}/?username=${username}&video_bitrate=${video_bitrate}&share_bitrate=${share_bitrate}`;
    }
    if (default_layout) {
      uriPath += `&default_layout=${default_layout}`;
    }
    if (use_dummy_device) {
      uriPath += `&use_dummy_device=${use_dummy_device}`;
    }
    /* eslint-enable @typescript-eslint/camelcase */
    window.open(uriPath);
  };
  useEffect(() => {
    // URL paramsの`/room/:roomId/entrance` の roomId の部分を読み込んで roomId の初期値とする
    setRoomId(params.roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="start-layout">
      <LoginEntranceFormFieldGroup username={username} roomId={roomId} onChangeUsername={setUsername} onChangeRoomId={setRoomId} onSubmitSuccess={onSubmitSuccess} />
    </div>
  );
};

export default Entrance;
