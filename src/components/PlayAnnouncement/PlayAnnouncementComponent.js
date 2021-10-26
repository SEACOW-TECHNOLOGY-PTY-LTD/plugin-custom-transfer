import React, {useEffect, useState} from "react";
import Button from '@material-ui/core/Button';
import axios from 'axios';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import {Manager} from '@twilio/flex-ui'
import InputBase from '@material-ui/core/InputBase';
import LinearWithValueLabel from "./ProgressBar";

const BootstrapInput = withStyles((theme) => ({
    root: {
        'label + &': {
            marginTop: theme.spacing(3),
        },
    },
    input: {
        borderRadius: 4,
        minWidth: 300,
        maxWidth: 360,
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #ced4da',
        fontSize: 16,
        padding: '10px 26px 10px 12px',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:focus': {
            borderRadius: 4,
            borderColor: '#80bdff',
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        },
    },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
}));

const PlayAnnouncementComponent = (props) => {
    const classes = useStyles();
    console.log("get:", process.env)
    const [selectedFile, setSelectedFile] = useState({})
    const [disable, setDisable] = useState(true)
    const [files, setFiles] = useState([
        {
            name: '',
            key: 1,
            src: "",
            length: 0
        },
        {
            name: 'CBA Terms Conditions',
            key: 2,
            src: "https://common-4659-dev.twil.io/AIA-Health-Verbal-AGR/CBA_T_C.wav",
            length: 132
        },
        {
            name: 'AIA Verbal AGR',
            key: 3,
            src: "https://common-4659-dev.twil.io/AIA-Health-Verbal-AGR/AIA-Verbal-AGR---02.06.2021.mp3",
            length: 52
        }
    ])

    const [progress, setProgress] = React.useState(0);
    const [length, setLength] = useState(0);
    const [fileName, setFileName] = useState('')
    const [playFile, setPlayFile] = useState({})
    const [timer, setTimer] = React.useState(null);

    useEffect(() => {
        setPlayFile(selectedFile)
    }, [selectedFile])

    const start = (playFile) => {
        setTimer((prevTimer) => {
            clearInterval(prevTimer)
        })
        setFileName(playFile.name)
        setTimer(setInterval(() => {
            setProgress((prevProgress) => {
                return prevProgress >= 100 ? 100 : prevProgress + 1 / (playFile.length || 1) * 100
            });
        }, 1000))
    }

    const end = () => {
        setFileName('')
        setDisable(false)
        muteAgent(false)
        setTimer((prevTimer) => {
            clearInterval(prevTimer)
        })
    }

    useEffect(() => {
        if (progress === 100) {
            end()
        }
    }, [progress])

    const playFunc = () => {
        if (!playFile) return
        setLength(playFile.length)
        let customerSid;
        let participants = props.conference.source.participants;
        for (let i in participants) {
            if (participants[i].participantType === 'customer') customerSid = participants[i].callSid;
        }
        axios.post(`https://play-announcement-9886-dev.twil.io/announce`,
            {
                Sid: props.conference.source.conferenceSid,
                participantSid: customerSid,
                announceUrl: playFile.src
            }).then(res => {
            muteAgent(true)
            console.log("testFunc:", res)

            setProgress(0)
            start(playFile)
            setLength(playFile.length)
            setDisable(true)
        })
    }

    const muteAgent = (mute) => {
        const manager = Manager.getInstance()
        const voice = manager.voiceClient
        const connection = voice.activeConnection()
        connection.mute(mute)
    }

    const handleChange = (event) => {
        setSelectedFile(event.target.value);
        console.log("value:", event.target.value)
        if (!event.target.value.src) {
            setDisable(true)
            return
        }
        setDisable(false)
    };

    return (
        <div style={{padding: 15, textAlign: 'center'}}>
            <LinearWithValueLabel progress={progress} length={length} name={fileName}/>
            <FormControl variant="outlined" className={classes.margin}>
                <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    MenuProps={{
                        anchorOrigin: {
                            vertical: "top",
                            horizontal: "left"
                        },
                        transformOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                        },
                        getContentAnchorEl: null
                    }}
                    input={<BootstrapInput/>}
                    value={selectedFile}
                    onChange={handleChange}
                >
                    {
                        files.map(elem => {
                            return (
                                <MenuItem key={elem.key} value={elem} style={{height: 36}}>{elem.name}</MenuItem>
                            )
                        })
                    }
                </Select>
            </FormControl>
            <FormControl variant="outlined" className={classes.margin}>
                <Button
                    style={{height: 40}}
                    color="primary"
                    variant="contained"
                    size="medium"
                    disabled={disable}
                    onClick={() => {
                        if (!selectedFile.src) {
                            return
                        }
                        playFunc()
                    }}
                >
                    Play
                </Button>
            </FormControl>
        </div>
    )
}

export default (PlayAnnouncementComponent);
