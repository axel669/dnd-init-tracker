import {Grid, GridBreak, Col} from 'src/Grid';
import Button from 'src/Button';
import Select from 'src/Select';
import AutoUpdateCheck from 'src/AutoUpdateCheck';

const initOptions = [
    ...(new Array(21).fill(0)).map((a, i) => i - 10).map(i => <option value={i}>{i}</option>),
    <option hidden value="-">Init</option>,
    ...(new Array(20).fill(0)).map((a, i) => i + 10).map(i => <option value={i}>{i}</option>)
];
const defaultState = () => ({name: '', init: '-'});
class Main extends AutoUpdateCheck {
    constructor(props) {
        super(props);
        this.propList = ['allyList', 'enemyList', 'inits'];
        this.state = defaultState();
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
            <div style={{width: '100%', maxWidth: 480, margin: 'auto'}}>
                <Grid>
                    <Col size={12}>
                        <Button onTap={() => actions.screen.set('ally').dispatch()} text="Ally List" block />
                    </Col>

                    {/* <Col size={6}>Name</Col>
                    <Col size={6}>Initiative</Col> */}

                    {/* <Col size={8}>
                        <input type="text" style={{width: '100%', color: 'white'}} value={name} onChange={this.linkState('name')} />
                    </Col> */}
                    <Col size={9}>
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
                    <Col size={3}>
                        <Select value={init} onChange={this.linkState('init')}>
                            {/* {new Array(41).fill(0).map((a, i) => <option value={i - 10}>{i - 10}</option>)} */}
                            {initOptions}
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

export default Main;
