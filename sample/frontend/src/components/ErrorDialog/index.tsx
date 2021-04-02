import '@material/dialog/dist/mdc.dialog.css';
import '@material/button/dist/mdc.button.css';
import '@material/ripple/dist/mdc.ripple.css';

import { Dialog, DialogActions, DialogButton, DialogContent } from '@rmwc/dialog';
import React from 'react';

interface ErrorDialogProps {
  onClose: () => void;
  message: string | null;
  open: boolean;
}

const ErrorDialog: React.FC<ErrorDialogProps> = (props) => {
  return (
    <Dialog open={props.open}>
      <DialogContent>{props.message}</DialogContent>
      <DialogActions>
        <DialogButton action="close" isDefaultAction onClick={props.onClose}>
          閉じる
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
