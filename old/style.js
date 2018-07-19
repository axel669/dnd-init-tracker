import ssjs from 'ssjs';

const sheet = ssjs.create();

sheet.addStyles({
    "html, body": {
        padding: 0,
        margin: 0,
        width: '100%',
        height: '100%'
    },
    "body": {
        backgroundColor: '#000',
        color: 'white',
        fontFamily: 'Roboto',
        fontSize: 16
    },
    "*": {
        boxSizing: 'border-box'
    },
    "input[type='text']": {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottom: '2px solid white',
        color: 'white',
        display: 'block',
        width: '100%',
        height: 25
    },
    "button": {
        borderRadius: 0,
        border: '1px solid white',
        backgroundColor: 'transparent',
        color: 'white'
    }
});

export default sheet;
