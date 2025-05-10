import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { notification } from 'antd';

function useComplaintNotification() {
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5239/complaintHub') // Đúng endpoint hub backend của bạn
    .withAutomaticReconnect()
    .build();


    // Lắng nghe sự kiện thông báo
    connection.on('ReceiveComplaintNotication', (message) => {

      console.log("message", message);
      // Hiển thị thông báo cho user
      notification.info({
        message: 'Thông báo khiếu nại mới',
        description: message,
        placement: 'topRight',
        duration: 4
      });
    });

    connection.start()
      .catch(err => console.error('SignalR Connection Error: ', err));

    return () => { connection.stop(); };
  }, []);
}

export default useComplaintNotification;