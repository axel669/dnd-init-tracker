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

const defaultState = () => ({name: '', init: '-'});
class Tracker2 extends AutoUpdateCheck {
    constructor(props) {
        super(props);
        this.propList = ['allyList', 'enemyList', 'inits'];
        this.state = defaultState();
    }

    update = name =>
        evt => {
            const value = evt.target.value;
            this.setState(
                () => ({[name]: value})
            )
        }

    changeName = evt => {
        let value = evt.target.value;
        if (value === ':new-enemy') {
            value = prompt("Enemy Name", "");
            if (value === null || value.trim() === '') {
                return;
            }
            actions.enemy.add(value).dispatch();
        }
        this.setState(() => ({name: value}));
    }

    add = () => {
        const {name, init} = this.state;
        const status = name.slice(0, 4);
        const realName = name.slice(5);
        this.setState(defaultState);
        actions.inits.add(realName, init, status).dispatch();
    }
    sort = () => actions.inits.sort().dispatch()

    render = () => {
        const {name, init} = this.state;
        const {allyList, enemyList, inits} = this.props;

        return (
            <div>
                <Grid>
                    <Col size={12}>
                        <Button onTap={() => actions.screen.set('ally').dispatch()} text="Ally List" block />
                    </Col>

                    <Col size={6}>Name</Col>
                    <Col size={6}>Initiative</Col>

                    <Col size={6}>
                        <Select value={name} onChange={this.changeName}>
                            <option value="" hidden>Name</option>
                            <optgroup label="Allies">
                                {allyList.map(
                                    ally => <option value={`ally:${ally}`}>{ally}</option>
                                )}
                            </optgroup>
                            <optgroup label="Enemies">
                                <option value=":new-enemy">New Enemy</option>
                                {enemyList.map(
                                    enemy => <option value={`enem:${enemy}`}>{enemy}</option>
                                )}
                            </optgroup>
                        </Select>
                    </Col>
                    <Col size={6}>
                        <Select value={init} onChange={this.update('init')}>
                            {new Array(41).fill(0).map((a, i) => <option value={i - 10}>{i - 10}</option>)}
                        </Select>
                    </Col>

                    <Col size={4} offset={2}>
                        <Button onTap={this.add} primary text="Add" block />
                    </Col>
                    <Col size={4}>
                        <Button onTap={this.sort} primary text="Sort" block />
                    </Col>
                </Grid>

                {inits.map(
                    item => <div>{item.name} - {item.init}</div>
                )}
            </div>
        );
    }
}

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
    main: Tracker2,
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
