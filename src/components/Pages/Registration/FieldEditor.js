/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Type } from 'react-bootstrap-table2-editor';

let changeTimeOut;

class FieldEditor extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    event.persist();
    const { handleChange, fieldName, type } = this.props;
    clearTimeout(changeTimeOut);
    changeTimeOut = setTimeout(
      () => {
        handleChange(
          ['attended'].includes(fieldName)
            ? parseInt(event.target.value, 10)
            : type === Type.CHECKBOX
            ? event.target.checked
              ? 1
              : 0
            : event.target.value,
          event.target.name,
        );
      },
      type === Type.SELECT ? 0 : 500,
    );
  }

  render() {
    const { type, fieldName, options, fieldValue } = this.props;
    let { value } = this.props;
    if (fieldValue !== null) value = fieldValue;
    switch (type) {
      case Type.TEXT:
        return (
          <input
            name={fieldName}
            onChange={this.handleChange}
            className="form-control"
            type="text"
            defaultValue={value}
          />
        );
      case Type.CHECKBOX:
        return (
          <input
            name={fieldName}
            onChange={this.handleChange}
            type="checkbox"
            defaultChecked={!!value}
          />
        );
      case Type.SELECT:
        return (
          <select
            name={fieldName}
            onChange={this.handleChange}
            defaultValue={value}
            className="form-control"
          >
            {options.map(({ id: optionValue, label }) => (
              <option key={optionValue} value={optionValue}>
                {label}
              </option>
            ))}
          </select>
        );
      default:
        return <input className="form-control" type="text" defaultValue={value} />;
    }
  }
}

export default FieldEditor;

FieldEditor.propTypes = {
  type: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  fieldValue: PropTypes.any,
  value: PropTypes.any.isRequired,
  handleChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.object),
};

FieldEditor.defaultProps = {
  fieldValue: null,
  options: [],
};
