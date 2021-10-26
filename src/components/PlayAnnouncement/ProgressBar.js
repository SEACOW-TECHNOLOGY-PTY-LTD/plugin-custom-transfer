import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import {Grid} from "@material-ui/core";

function LinearProgressWithLabel(props) {
    return (
        <Grid container alignItems="center">
            <Grid item xs={12} style={{marginBottom: '8px'}}>
                <Typography variant="body2" color="textSecondary">
                    Now Playing: <strong>{props.name}</strong>
                </Typography>
            </Grid>
            <Grid item xs={2}/>
            <Grid item xs={8}>
                <LinearProgress variant="determinate" {...props} />
            </Grid>
            <Grid item xs={2}/>
            <Grid item xs={12} style={{marginTop: '8px'}}>
                <Typography variant="body2" color="textSecondary">
                    {
                        `${Math.round(
                            props.value * props.length / 100,
                        )} s / ${props.length} s`
                    }
                </Typography>
            </Grid>
        </Grid>
    );
}

LinearProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate and buffer variants.
     * Value between 0 and 100.
     */
    value: PropTypes.number.isRequired,
};


export default function LinearWithValueLabel(props) {
    return (
        <LinearProgressWithLabel value={props.progress} length={props.length} name={props.name}/>
    );
}
