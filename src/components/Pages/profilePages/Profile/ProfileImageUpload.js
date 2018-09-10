import React, { Component } from 'react';
import ProfileImageUploader from 'react-avatar-edit';

class ProfileImageUpload extends Component {
  constructor() {
    super();
    this.state = {
      image: null,
    };
    this.onCrop = this.onCrop.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    this.setState({ image: null });
  }

  onCrop(image) {
    this.setState({ image });
  }

  render() {
    return (
      <div className="d-flex justify-content-around">
        <ProfileImageUploader
          width={400}
          height={400}
          minCropRadius={100}
          onCrop={this.onCrop}
          onClose={this.onClose}
        />
        <div className="d-flex justify-content-center align-items-center">
          <img src={this.state.image} height={300} width={300} alt="Preview" />
        </div>
      </div>
    );
  }
}

export default ProfileImageUpload;
