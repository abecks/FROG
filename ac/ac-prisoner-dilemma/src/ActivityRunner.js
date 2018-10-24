// @flow

import * as React from 'react';
import { type ActivityRunnerT } from 'frog-utils';
import { withStyles } from '@material-ui/core/styles';

import Scoreboard from './Scoreboard';
import Players from './Players';
import Buttons from './Buttons';

// Styles

const styles = {
    result: {
        marginTop: '100px',
        fontSize: '50px',
        lineHeight: '45px',
        textAlign: 'center',
        width: '100%',
    }
};

// Props types
type StyledPropsT = ActivityRunnerPropsT & { classes: Object };

// Component

class PrisonerDilemmaController extends React.Component<StyledPropsT> {

    // Constructor

    constructor(props) {
        super(props);

        // TODO: use structure in props giving mapping id -> name (where it is?)
        this.props.dataFn.objInsert({
                name: this.props.userInfo.name,
                score: 0
            },
            this.props.userInfo.id
        );

        this.props.dataFn.objInsert(
            {0: {}},
            'rounds'
        );
    }

    // Methods

    renderGame(students, round, disableButtons) {
        if (!this.props.data.winner) {
            return (
                <div>
                    <Players
                        students={students}
                        round={round}
                        roundsLog={this.props.data.rounds}
                    />

                    <hr/>

                    <Buttons
                        id={this.props.userInfo.id}
                        dataFn={this.props.dataFn}
                        disableButtons={disableButtons}
                        round={round}
                    />
                </div>
            );
        } else {
            // Game finished: show result
            const a = this.props.data[students[0]].score;
            const b = this.props.data[students[1]].score;

            const text = (a === b) ? "Tie!" : ((a > b) ?
                this.props.data[students[0]].name + " won!" :
                this.props.data[students[1]].name + " won!");

            return (
                <div className={this.props.classes.result}>
                        {text}
                </div>
            );
        }
    }

    // Rendering

    render() {

        // Only two students can compete, others are spectator
        const students = Object.keys(this.props.data)
            .filter(k => k !== 'rounds')
            .sort()
            .splice(0, 2);

        // Not enough students yet: wait
        if (!('rounds' in this.props.data) || students.length < 2) {
            return (<div> Charging ... </div>);
        }

        const round = Object.keys(this.props.data['rounds']).length;

        const disableButtons = students.indexOf(this.props.userInfo.id) < 0 ||
            this.props.userInfo.id in this.props.data.rounds[(round - 1).toString()];

        return (
            <div>
                <Scoreboard
                    data={this.props.data}
                    dataFn={this.props.dataFn}
                    config={this.props.activityData.config}
                    students={students}
                    round={round}
                />

                {this.renderGame(students, round, disableButtons)}
            </div>
        );
    }
}

// Export

const StyledPrisonerDilemma = withStyles(styles)(PrisonerDilemmaController);
const PrisonerDilemma: ActivityRunnerT = (props: ActivityRunnerPropsT) => (
  <StyledPrisonerDilemma {...props} />
);

export default PrisonerDilemma;
