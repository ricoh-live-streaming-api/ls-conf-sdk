import './Entrance.css';

import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoginEntranceFormFieldGroup from '@/components/LoginEntranceFormFieldGroup';

const Entrance: React.FC<Record<string, never>> = () => {
  const params: { roomId: string } = useParams();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { video_bitrate, share_bitrate, default_layout, enable_video, enable_audio, use_dummy_device, bitrate_reservation_mbps, room_type, video_codec, is_debug } = qs.parse(window.location.search);
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const onSubmitSuccess = (): void => {
    const encodedUsername = encodeURIComponent(username);
    let uriPath = `/room/${roomId}/?username=${encodedUsername}`;
    /* eslint-disable @typescript-eslint/naming-convention */
    if (video_bitrate && !isNaN(Number(video_bitrate))) {
      uriPath += `&video_bitrate=${video_bitrate}`;
    }
    if (share_bitrate && !isNaN(Number(share_bitrate))) {
      uriPath += `&share_bitrate=${share_bitrate}`;
    }
    if (default_layout) {
      uriPath += `&default_layout=${default_layout}`;
    }
    if (enable_video) {
      uriPath += `&enable_video=${enable_video}`;
    }
    if (enable_audio) {
      uriPath += `&enable_audio=${enable_audio}`;
    }
    if (use_dummy_device) {
      uriPath += `&use_dummy_device=${use_dummy_device}`;
    }
    if (bitrate_reservation_mbps && !isNaN(Number(bitrate_reservation_mbps))) {
      uriPath += `&bitrate_reservation_mbps=${bitrate_reservation_mbps}`;
    }
    if (room_type) {
      uriPath += `&room_type=${room_type}`;
    }
    if (video_codec && (video_codec === 'h264' || video_codec === 'vp8' || video_codec === 'vp9' || video_codec === 'h265' || video_codec === 'av1')) {
      uriPath += `&video_codec=${video_codec}`;
    }
    if (is_debug) {
      uriPath += `&is_debug=${is_debug}`;
    }
    /* eslint-enable @typescript-eslint/naming-convention */
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
