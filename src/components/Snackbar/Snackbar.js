import React, { Component } from 'react';
import MaterialSnackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';

class Snackbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props.open,
    };

    this.handleClose = this.handleClose.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({ open: props.open });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    const { message, duration } = this.props;
    const { open } = this.state;

    return (
      <MaterialSnackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        onClose={this.handleClose}
        autoHideDuration={duration}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{message}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={this.handleClose}
          >
            <i className="fas fa-xs fa-times" />
          </IconButton>,
        ]}
      />
    );
  }
}

export default Snackbar;
