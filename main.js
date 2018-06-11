import 'gesturesjs';

import React from 'react';
import ReactDOM from 'react-dom';

import sheet from 'style';

import AutoUpdateCheck from 'src/AutoUpdateCheck';
import Button from 'src/Button';
import CustomListeners from 'src/CustomListeners';
import {Grid, GridBreak, Col} from 'src/Grid';
import Select from 'src/Select';

import update from 'update';
import store from 'store/store';

import Main from 'screen/Main';

const dialog = (() => {
    const dialogRoot = document.createElement('div');
    dialogRoot.style.position = 'absolute';
    dialogRoot.style.top = '0px';
    dialogRoot.style.left = '0px';

    document.body.appendChild(dialogRoot);

    const DialogBox = ({options, close}) => {
        return (
            <div style={{backgroundColor: '#00000040', position: 'fixed', width: '100%', height: '100%'}}>
                <div style={{position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white'}}>
                    <div><options.content /></div>
                    <div><options.buttons close={close} /></div>
                </div>
            </div>
        );
    };
    class Dialogs extends React.Component {
        constructor(props) {
            super(props);
            this.state = {list: []};
        }

        render() {
            const {list} = this.state;

            return (
                <React.Fragment>
                    {list.map(
                        (options, index) => {
                            close = () => {
                                const {list} = this.state;
                                list.splice(index, 1);
                                this.setState({list});
                            };
                            return <DialogBox key={options.id} options={options} close={close} />;
                        }
                    )}
                </React.Fragment>
            );
        }
    }

    const manager = ReactDOM.render(
        <Dialogs />,
        dialogRoot
    );

    return {
        show(options) {
            options = update(options, {"id.$set": `${Date.now()}:${Math.random()}`});
            const newState = update(
                manager.state,
                {"list.$push": [options]}
            );
            manager.setState(newState);
        }
    };
})();

store.subscribe(
    () => {
        localStorage.allyList = JSON.stringify(
            store.getState().allyList
        );
    }
);

const makeDobuleTap = (source, dbltap) => {
    let prevTap = 0;

    return (...args) => {
        source(...args);
        const now = Date.now();
        if (now - prevTap < 300) {
            dbltap(...args);
            prevTap = 0;
        }
        else {
            prevTap = now;
        }
    };
};

sheet.addStyles({
    "test": {
        display: 'none',
        position: 'fixed',
        right: 0,
        bottom: 0,
        left: 0,
        height: 50,
        backgroundColor: 'green'
    },
    "div:focus > test": {
        display: 'block'
    }
});
const DBLTAP = (props) => {
    const passedOnTap = props.onTap || (() => {});
    const onHold = props.onHold || (() => {});
    const onTap = makeDobuleTap(
        passedOnTap,
        evt => {
            console.log('double tap!');
        }
    );

    return (
        <div tabIndex="0" onContextMenu={evt => evt.preventDefault()} style={{width: 50, height: 50, backgroundColor: 'cyan'}}>
            <CustomListeners listeners={{onTap, onHold}} />
            <test />
        </div>
    );
};

class AllyScreen extends AutoUpdateCheck {
    constructor(props) {
        super(props);
        this.propList = ['allyList'];
    }

    toMain = () => actions.screen.toMain().dispatch()
    add = () => {
        const newAlly = prompt("Name", "");

        if (newAlly !== null && newAlly.trim() !== '') {
            actions.ally.add(newAlly).dispatch();
        }
    };

    render = () => {
        const {allyList} = this.props;

        return (
            <div>
                <DBLTAP onTap={() => console.log('tap!')} onHold={evt => console.log('hold!')} />
                <Button onTap={this.toMain} text="Back" />
                <br />
                <Button onTap={this.add} text="Add Ally" />
                <div>
                    {allyList.map(
                        name => <div>{name}</div>
                    )}
                </div>
            </div>
        );
    }
}

const screens = {
    main: Main,
    ally: AllyScreen
};

const updateStore = prev => store.getState();
class ScreenChanger extends React.Component {
    constructor(props) {
        super(props);
        this.state = store.getState();
        store.subscribe(
            () => this.setState(updateStore)
        );
    }

    render = () => {
        const Screen = screens[this.state.currentScreen];
        return <Screen {...this.state} />;
    }
}

sheet.attach();
ReactDOM.render(
    <ScreenChanger />,
    document.querySelector("app-root")
);
