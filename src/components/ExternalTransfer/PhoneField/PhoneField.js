import React from 'react';
import ReactPhoneInput from 'react-phone-input-material-ui';
import {TextField, withStyles} from '@material-ui/core';

const styles = theme => ({
  field: {
    margin: '10px 0',
  },
  countryList: {
    ...theme.typography.body1,
  },
});

function PhoneField(props) {
  const {value, defaultCountry, onChange, classes, inputProps} = props;

  return (
      <React.Fragment>
        <ReactPhoneInput
            value={value}
            defaultCountry={defaultCountry || 'au'}
            country={'au'}
            onChange={onChange}
            inputClass={classes.field}
            dropdownClass={classes.countryList}
            component={TextField}
            inputProps={inputProps}
            enableAreaCodes={true}
            specialLabel={'Phone Number'}
        />
      </React.Fragment>
  );
}

export default withStyles(styles)(PhoneField);